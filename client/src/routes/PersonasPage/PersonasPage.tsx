import { Card } from '@client/components/Card';
import styles from './PersonasPage.module.scss';
import { Button } from '@client/components/Button';
import { HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi2';
import { useMemo, useState } from 'react';
import { usePageTitle } from '@client/utils/hooks';
import { PersonaInSchemaType, PersonaSchemaType } from '@server/schemas/personas';
import { WithLabel } from '@client/components/WithLabel';
import { Input, Textarea } from '@client/components/Input';
import { useDeletePersonaMutation, useEditPersonaMutation, useNewPersonaMutation, usePersonas } from '@client/api';
import { Switch } from '@client/components/Switch';
import { WithSnippets } from '@client/components/WithSnippets';
import { Slider } from '@client/components/Slider';
import { EmojiPopover } from '@client/components/EmojiPopover';
import { Empty } from '@client/components/Empty';
import dayjs from 'dayjs';
import { DropdownMenu } from '@client/components/DropdownMenu';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import clsx from 'clsx';

type PersonaFormProps = {
  title: string,
  defaultValue?: PersonaInSchemaType,
  loading?: boolean;
  onCancel?: VoidFunction,
  onSave?: (val: PersonaInSchemaType) => void,
}

const PersonaForm = ({ onCancel, onSave, loading, defaultValue, title }: PersonaFormProps) => {
  const [personaName, setPersonaName] = useState(defaultValue?.name ?? '');
  const [personaAvatar, setPersonaAvatar] = useState(defaultValue?.avatar ?? '👩🏻‍🦰');
  const [personaSystem, setPersonaSystem] = useState(defaultValue?.system ?? null);
  const [personaTemperature, setPersonaTemperature] = useState(defaultValue?.temperature ?? null);

  return (<div className={styles.newPersonaWizard}>
    <div className={styles.formTitle}>{title}</div>

    <div className={styles.topRow}>
      <EmojiPopover
        side='bottom'
        onSelect={(emoji) => setPersonaAvatar(emoji)}
      >
        <Button className={styles.avatarButton} variant='borderless' size='large'>{personaAvatar}</Button>
      </EmojiPopover>
      <WithLabel label='Name:' className={styles.nameWrapper}>
        <Input className={styles.input} placeholder='Assistant' value={personaName} onValueChange={setPersonaName} />
      </WithLabel>
    </div>
    <Switch checked={personaSystem !== null} onChange={(checked) => setPersonaSystem(checked ? '' : null)}>
      Custom system message
    </Switch>
    {personaSystem !== null && <WithSnippets>
      <Textarea
        placeholder='System prompt'
        className={styles.input}
        value={personaSystem}
        onValueChange={setPersonaSystem}
        minRows={6}
      />
    </WithSnippets>}

    <Switch checked={personaTemperature !== null} onChange={(checked) => setPersonaTemperature(checked ? 0.8 : null)}>
      Adjust temperature
    </Switch>
    {personaTemperature !== null && <Slider
      value={personaTemperature}
      onValueChange={setPersonaTemperature}
      minLabel='Predictive'
      maxLabel='Creative'
      min={0}
      max={1}
      precision={2}
    />}

    <div className={styles.actions}>
      <Button
        variant='primary'
        size='large'
        loading={loading}
        onClick={() => onSave?.({ name: personaName, avatar: personaAvatar, system: personaSystem, temperature: personaTemperature })}
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
};

const Persona = (props: PersonaSchemaType) => {
  const { id, avatar, name } = props;
  const [isEditing, setIsEditing] = useState(false);

  const editPersona = useEditPersonaMutation(id);
  const deletePersona = useDeletePersonaMutation(id);

  return (<Card className={clsx(styles.persona, deletePersona.isPending && styles.ghost)} withScrollArea={false}>
    {isEditing && <PersonaForm
      title='Edit persona'
      defaultValue={props}
      onCancel={() => setIsEditing(false)}
      onSave={async (val) => {
        await editPersona.mutateAsync(val);
        setIsEditing(false);
      }}
      loading={editPersona.isPending}
    />}
    {!isEditing && <>
      <div className={styles.avatar}>{avatar}</div> 
      <div className={styles.name}>{name}</div>
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
              onSelect={() => deletePersona.mutate()}
            >
              Delete
            </DropdownMenu.Item>
          </>}
        >
          <Button className={styles.menuButton} size='small' variant='borderless' icon={<HiOutlineDotsVertical />} />
        </DropdownMenu>
    </>}
  </Card>)
};

export const PersonasPage = () => {
  const [newPersonaWizardVisible, setShowNewPersonaWizard] = useState(false);

  const createPersona = useNewPersonaMutation();

  const { data: personas } = usePersonas();

  usePageTitle('Personas');

  return (<Card flexGrow>
    <div className={styles.PersonasPage}>
      <div className={styles.content}>
        <div className={styles.title}>
          <div>Personas</div>
          <div className={styles.titleActions}>
            <Button onClick={() => setShowNewPersonaWizard(true)} icon={<HiPlus />} variant='borderless' size='large' />
          </div>
        </div>

        {newPersonaWizardVisible && <Card>
          <PersonaForm
            title="New persona"
            onCancel={() => setShowNewPersonaWizard(false)}
            onSave={async (val) => {
              await createPersona.mutateAsync(val);
              setShowNewPersonaWizard(false);
            }}
            loading={createPersona.isPending}
          />
        </Card>}

        <div className={styles.personas}>
          {personas.length === 0 && <Empty text='No personas' />}
          {personas.map(p => {
            return (<Persona key={p.id} {...p} />)
          })}
        </div>
      </div>
    </div>
  </Card>);
};
