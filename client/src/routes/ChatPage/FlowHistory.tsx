import { useChatPageContext } from "@client/routes/ChatPage/context";
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, Node, Edge, useReactFlow, ReactFlowProvider, NodeProps, Handle, Position, MarkerType, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './ChatPage.module.scss';
import { useEffect, useMemo, useRef } from "react";
import Dagre from '@dagrejs/dagre';
import { MessageSchemaType } from "@shared/api";
import { MessageBubble, MessageBubbleActionsProp } from "@client/components/MessageBubble";
import { iife } from "@shared/utils";
import { useDeleteMessageMutation, useDuplicateMessageMutation, useEditMessageMutation, usePersonas, useRegenerateMessageMutation, useSendMessageMutation } from "@client/api";
import { ProviderIcon } from "@client/components/icons";
import useMotionMeasure from 'react-use-motion-measure'
import { createStrictContext } from "@client/utils/context";

const [ScrollToNodeProvider, useScrollToNode] = createStrictContext<{ scrollToNode: (id: string | number, activateReply?: boolean) => void }>('ScrollToNode');

type MessageNodeType = Node<MessageSchemaType, 'message'>;

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
      <Handle isConnectable={false} type="target" position={Position.Top} />
      <MessageBubble
        senderName={sender}
        message={message}
        actions={actions}
      />
      <Handle isConnectable={false} type="source" position={Position.Bottom} />
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

  const shouldLoadPostionRef = useRef(true);
  const [nodes, setNodes, onNodesChagne] = useNodesState<MessageNodeType>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  useEffect(() => {
    setNodes(transformMessagesIntoNodes(chatInfo.messages));
    setEdges(transformMessagesIntoEdges(chatInfo.messages));
  }, [chatInfo.messages]);

  useEffect(() => {
    // TODO: load position from storage, or focus on last message if none saved
    const allMeasured = nodes.every(n => n.measured?.height !== undefined);
    if (!shouldLoadPostionRef.current || nodes.length === 0 || !allMeasured) return;
    const sortedMessages = [...chatInfo.messages].sort((a, b) => a.createdAt - b.createdAt);
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    console.log('Last message', lastMessage);
    console.log('Nodes', nodes);
    scrollToNode(lastMessage.id);
    shouldLoadPostionRef.current = false;
  }, [nodes]);

  const layouted = useMemo(() => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'TB',
      nodesep: 100,
      ranksep: 100
    });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) => {
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 200,
        height: node.measured?.height ?? 200,
      });
    });

    Dagre.layout(g);

    return {
      nodes: nodes.map((node) => {
        const position = g.node(node.id);
        const x = position.x - (node.measured?.width ?? 200) / 2;
        const y = position.y - (node.measured?.height ?? 200) / 2;

        return { ...node, position: { x, y } };
      }),
      edges,
    };
  }, [nodes, edges]);

  const [ref, bounds] = useMotionMeasure();

  return (
    <ScrollToNodeProvider value={{ scrollToNode }}>
      <ReactFlow<MessageNodeType>
        ref={ref}
        nodes={layouted.nodes}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodesFocusable={true}

        edges={layouted.edges}
        edgesFocusable={false}

        proOptions={{ hideAttribution: true }}
        onNodesChange={onNodesChagne}

        onPointerDown={() => window.getSelection()?.removeAllRanges()}

        zoomOnScroll={false}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        panOnScroll
        minZoom={0.1}
        maxZoom={1}
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
