import { useChatPageContext } from "@client/routes/ChatPage/context";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, Edge, useReactFlow, ReactFlowProvider, NodeProps, Handle, Position, MarkerType, useNodesState, useEdgesState, CoordinateExtent } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './ChatPage.module.scss';
import { useEffect, useMemo, useRef } from "react";
import { MessageSchemaType } from "@shared/api";
import { MessageBubble, MessageBubbleActionsProp } from "@client/components/MessageBubble";
import { iife } from "@shared/utils";
import { useDeleteMessageMutation, useDuplicateMessageMutation, useEditMessageMutation, usePersonas, useRegenerateMessageMutation, useSendMessageMutation } from "@client/api";
import { ProviderIcon } from "@client/components/icons";
import useMotionMeasure from 'react-use-motion-measure'
import { createStrictContext } from "@client/utils/context";
import { MessageNodeType } from "@client/routes/ChatPage/types";
import { layoutNodes } from "@client/routes/ChatPage/layout";

const [ScrollToNodeProvider, useScrollToNode] = createStrictContext<{ scrollToNode: (id: string | number, activateReply?: boolean) => void }>('ScrollToNode');

const MessageNode = ({ data: message }: NodeProps<MessageNodeType>) => {
  const { scrollToNode } = useScrollToNode();
  const { data: personas } = usePersonas();
  const regenerateMessage = useRegenerateMessageMutation();
  const duplicateMessage = useDuplicateMessageMutation();
  const editMessage = useEditMessageMutation();
  const deleteMessage = useDeleteMessageMutation();
  const sendMessage = useSendMessageMutation();
  const { chatInfo, chatId } = useChatPageContext();

  const siblingMessages = chatInfo.messages.filter(m => m.parentId === message.parentId);
  const isSingleRootMessage = siblingMessages.length === 1 && message.parentId === null;
  const isAiMessageWithoutSiblings = message.sender === 'ai' && siblingMessages.length === 1;

  const icon = iife(() => {
    if (message.sender !== 'ai') return null;
    if (chatInfo.chat.personaId) {
      const persona = personas.find(p => p.id === chatInfo.chat.personaId);
      if (persona) {
        return <div className={styles.personaAvatar}>{persona.avatar}</div>
      }
    }

    return (<ProviderIcon provider={message.providerId!} />);
  });
  const name = iife(() => {
    if (message.sender === 'ai' && chatInfo.chat.personaId) {
      const persona = personas.find(p => p.id === chatInfo.chat.personaId);
      if (persona) {
        return `${persona.name} (${message.senderName})`;
      }
    }

    return message.senderName;
  });
  const sender = <>
    {icon}
    {name}
  </>;

  const sharedActions: Partial<MessageBubbleActionsProp> = {
    copy: !message.error,
    editing: message.error ? undefined : {
      allowRegenerateResponse: message.sender === 'user',
      onEdit: (text, regenerateResponse) => editMessage.mutateAsync({ chatId, payload: { messageId: message.id, text, regenerateResponse } })
    },
    onDelete: isSingleRootMessage || isAiMessageWithoutSiblings ? undefined : () => deleteMessage.mutateAsync({ chatId, messageId: message.id }),
  };
  const actions: MessageBubbleActionsProp = message.sender === 'user' ? {
    ...sharedActions,
  } : {
    ...sharedActions,
    onRegenerate: async () => {
      await regenerateMessage.mutateAsync({ chatId, messageId: message.id });
    },
    onDuplicate: message.error ? undefined : async () => {
      await duplicateMessage.mutateAsync({ chatId, messageId: message.id });
    },
    onSend: (text) => sendMessage.mutateAsync({
      chatId,
      payload: {
        text,
        parentId: message.id,
      }
    }).then(res => {
      if (res.newMessage) {
        setTimeout(() => {
          scrollToNode(res.newMessage!.id);
        }, 200);
      }
    })
  };

  return (
    <>
      <Handle className={styles.nodeHandle} isConnectable={false} type="target" position={Position.Top} />
      <MessageBubble
        senderName={sender}
        message={message}
        actions={actions}
      />
      <Handle className={styles.nodeHandle} isConnectable={false} type="source" position={Position.Bottom} />
    </>
  );
};

const nodeTypes = { 'message': MessageNode };

const transformMessagesIntoEdges = (messages: MessageSchemaType[]): Edge[] => {
  return messages.flatMap((message) => {
    if (message.parentId !== null) {
      return [{
        id: `e-${message.id}-${message.parentId}`,
        target: message.id.toString(),
        source: message.parentId.toString(),
        markerEnd: {
          type: MarkerType.Arrow,
          width: 32,
          height: 32,
        }
      }];
    }
    return []
  });
}

const transformMessagesIntoNodes = (messages: MessageSchemaType[]): MessageNodeType[] => {
  return messages.map((message) => {
    return {
      id: message.id.toString(),
      type: 'message',
      className: styles.messageNode,
      selectable: false,
      deletable: false,
      position: {
        x: 0,
        y: 0
      },
      data: message,
    };
  });
}

const FlowHistoryComponent = () => {
  const scrollToNode = (id: string | number, activateReply = false) => {
    const nodeId = id.toString();
    const node = getNode(nodeId);
    if (!node) {
      console.warn('Cant find node with id', id);
      return;
    }

    setCenter(
      node.position.x + (node.measured?.width ?? 200) / 2,
      node.position.y + (bounds.height.get() ?? 200) * 0.45,
      { duration: 650 },
    );
    if (activateReply) {
      setTimeout(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>(`[data-reply-textarea="${nodeId}"]`);
        console.log("textarea", `[data-reply-textarea="${nodeId}"]`, textarea);
        textarea?.focus();
      }, 600);
    }
  };

  const { chatInfo } = useChatPageContext();
  const { setCenter, getNode } = useReactFlow();

  const [nodes, setNodes, onNodesChagne] = useNodesState<MessageNodeType>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  useEffect(() => {
    setEdges(transformMessagesIntoEdges(chatInfo.messages));
    setNodes(prevNodes => {
      const newNodes = transformMessagesIntoNodes(chatInfo.messages);
      return newNodes.map(node => {
        const matchingOldNode = prevNodes.find(n => n.id === node.id);
        if (matchingOldNode) {
          return {
            ...structuredClone(matchingOldNode),
            data: node.data,
          };
        }
        return node;
      })
    });
  }, [chatInfo.messages]);

  const layoutedNodes = useMemo(() => {
    return layoutNodes(nodes, edges);
  }, [nodes, edges]);

  const translateExtent = useMemo<CoordinateExtent>(() => {
    if (layoutedNodes.length === 0) return [[-Infinity, -Infinity], [Infinity, Infinity]];

    const PADDING = 600;
    let left = layoutedNodes[0];
    let top = layoutedNodes[0];
    let right = layoutedNodes[0];
    let bottom = layoutedNodes[0];
    layoutedNodes.forEach(n => {
      const { x, y } = n.position;
      const { width = 200, height = 100 } = n.measured ?? {};
      if (x < left.position.x) left = n;
      if (y < top.position.y) top = n;
      if (x + width > right.position.x + (right.measured?.width ?? 200)) right = n;
      if (y + height > bottom.position.y + (bottom.measured?.height ?? 100)) bottom = n;
    });

    const topLeft: [number, number] = [left.position.x - PADDING, top.position.y - PADDING];
    const bottomRight: [number, number] = [right.position.x + (right.measured?.width ?? 200) + PADDING, bottom.position.y + (bottom.measured?.height ?? 100) + PADDING];
    return [topLeft, bottomRight];
  }, [layoutedNodes]);

  const [ref, bounds] = useMotionMeasure();

  console.log('Render flow', nodes);

  return (
    <ScrollToNodeProvider value={{ scrollToNode }}>
      <ReactFlow<MessageNodeType>
        ref={ref}
        nodes={layoutedNodes}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodesFocusable={true}

        edges={edges}
        edgesFocusable={false}

        proOptions={{ hideAttribution: true }}
        onNodesChange={onNodesChagne}

        onPointerDown={() => window.getSelection()?.removeAllRanges()}
        onEdgeClick={(e, edge) => scrollToNode(edge.target)}

        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        panOnScroll
        minZoom={0.1}
        maxZoom={1}
        translateExtent={translateExtent}
      >
        <Controls showInteractive={false} />
        <MiniMap<MessageNodeType>
          pannable
          nodeColor={(node) => node.data.sender === 'ai' ? "var(--jade-8)" : "var(--gray-8)"}
          nodeStrokeWidth={3}
          onNodeClick={(e, node) => scrollToNode(node.id)}
        />
        <Background variant={BackgroundVariant.Dots} gap={16 * 3} size={2} />
      </ReactFlow>
    </ScrollToNodeProvider>);
};

export const FlowHistory = () => {
  return (<ReactFlowProvider><FlowHistoryComponent /></ReactFlowProvider>);
}