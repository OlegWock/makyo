import { withErrorBoundary } from '@client/components/ErrorBoundary';
import styles from './SnippetsPage.module.scss';
import { Card } from '@client/components/Card';
import { usePageTitle } from '@client/utils/hooks';
import { useMemo, useState } from 'react';
import { Button } from '@client/components/Button';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi2';
import { WithLabel } from '@client/components/WithLabel';
import { Input, Textarea } from '@client/components/Input';
import { useDeleteSnippetMutation, useEditSnippetMutation, useNewSnippetMutation, useSnippets } from '@client/api';
import { SnippetInSchemaType, SnippetSchemaType } from '@server/schemas/snippets';
import { Empty } from '@client/components/Empty';
import { DropdownMenu } from '@client/components/DropdownMenu';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import clsx from 'clsx';
import dayjs from 'dayjs';

type SnippetFormProps = {
  title: string,
  defaultValue?: SnippetInSchemaType,
  loading?: boolean;
  onCancel?: VoidFunction,
  onSave?: (val: SnippetInSchemaType) => void,
}

const SnippetForm = ({ onCancel, onSave, loading, defaultValue, title }: SnippetFormProps) => {
  const [snippetName, setSnippetName] = useState(defaultValue?.name ?? '');
  const [snippetShortcut, setSnippetShortcut] = useState(defaultValue?.shortcut ?? '');
  const [snippetText, setSnippetText] = useState(defaultValue?.text ?? '');

  return (<div className={styles.newSnippetWizard}>
    <div className={styles.formTitle}>{title}</div>
    <WithLabel label='Name:'>
      <Input className={styles.input} placeholder='My snippet' value={snippetName} onValueChange={setSnippetName} />
    </WithLabel>
    <WithLabel
      label='Shortcut:'
      // hint='You can use any word as shortcut, but Makyo will show autocomplete only for shortcuts starting with / or @'
      hint='You can use any word as shortcut, even without leading / or @'
    >
      <Input className={styles.input} placeholder='E.g. /snip or @snip' value={snippetShortcut} onValueChange={setSnippetShortcut} />
    </WithLabel>
    <WithLabel label='Text:'>
      <Textarea className={styles.input} placeholder='Text of the snippet' value={snippetText} onValueChange={setSnippetText} minRows={6} />
    </WithLabel>

    <div className={styles.actions}>
      <Button
        variant='primary'
        size='large'
        loading={loading}
        onClick={() => onSave?.({ name: snippetName, shortcut: snippetShortcut, text: snippetText })}
      >
        Save
      </Button>
      <Button
        size='large'
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  </div>);
}

const Snippet = ({ id, name, shortcut, text, createdAt }: SnippetSchemaType) => {
  const [isEditing, setIsEditing] = useState(false);

  const editSnippet = useEditSnippetMutation();
  const deleteSnippet = useDeleteSnippetMutation();
  const date = useMemo(() => dayjs(createdAt).fromNow(), [createdAt]);

  let trimmedText = text.split('\n').slice(0, 4).join('\n').slice(0, 500);
  if (trimmedText.length < text.length) {
    trimmedText += '…';
  }

  return (<Card className={clsx(styles.snippet, deleteSnippet.isPending && styles.ghost)} withScrollArea={false}>
    {!isEditing && <>
      <div className={styles.nameWrapper}>
        <div className={styles.name}>{name}</div>
        <div className={styles.shortcut}>{shortcut}</div>
        <DropdownMenu
          menu={<>
            <DropdownMenu.Item
              type='normal'
              icon={<HiOutlinePencil />}
              onSelect={() => setIsEditing(true)}
            >
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              type='danger-with-confirmation'
              icon={<HiOutlineTrash />}
              onSelect={() => deleteSnippet.mutate(id)}
            >
              Delete
            </DropdownMenu.Item>
          </>}
        >
          <Button className={styles.menuButton} size='small' variant='borderless' icon={<HiOutlineDotsVertical />} />
        </DropdownMenu>
      </div>
      <div className={styles.text}>{trimmedText}</div>
      <div className={styles.datetime}>{date}</div>
    </>}
    {isEditing && <SnippetForm
      title='Edit snippet'
      defaultValue={{ name, shortcut, text }}
      onCancel={() => setIsEditing(false)}
      onSave={async (val) => {
        await editSnippet.mutateAsync({ snippetId: id, payload: val });
        setIsEditing(false);
      }}
      loading={editSnippet.isPending}
    />}
  </Card>)
}

export const SnippetsPage = withErrorBoundary(() => {
  const createSnippet = useNewSnippetMutation();
  const [showNewSnippetWizard, setShowNewSnippetWizard] = useState(false);

  const { data: snippets } = useSnippets();
  usePageTitle('Snippets');

  return (<Card flexGrow>
    <div className={styles.SnippetsPage}>
      <div className={styles.content}>
        <div className={styles.title}>
          <div>Snippets</div>
          <div className={styles.titleActions}>
            <Button onClick={() => setShowNewSnippetWizard(true)} icon={<HiPlus />} variant='borderless' size='large' />
          </div>
        </div>

        {showNewSnippetWizard && <Card>
          <SnippetForm
            title='New snippet'
            onCancel={() => setShowNewSnippetWizard(false)}
            onSave={async (val) => {
              await createSnippet.mutateAsync(val);
              setShowNewSnippetWizard(false);
            }}
            loading={createSnippet.isPending}
          />
        </Card>}

        <div className={styles.snippets}>
          {snippets.length === 0 && <Empty text='No snippets' />}
          {snippets.map(s => {
            return (<Snippet key={s.id} {...s} />)
          })}
        </div>
      </div>
    </div>
  </Card>);
});

SnippetsPage.displayName = 'PresetsPage';
