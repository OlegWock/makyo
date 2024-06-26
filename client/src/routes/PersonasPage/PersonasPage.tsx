import { Card } from '@client/components/Card';
import styles from './PersonasPage.module.scss';
import { Button } from '@client/components/Button';
import { HiMiniStar, HiOutlinePencil, HiOutlineTrash, HiPlus } from 'react-icons/hi2';
import { lazy, Suspense, useMemo, useState } from 'react';
import { usePageTitle } from '@client/utils/hooks';
import { PersonaInSchemaType, PersonaSchemaType } from '@server/schemas/personas';
import { WithLabel } from '@client/components/WithLabel';
import { Input, Textarea } from '@client/components/Input';
import { useDeletePersonaMutation, useEditPersonaMutation, useModels, useNewPersonaMutation, usePersonas } from '@client/api';
import { Switch } from '@client/components/Switch';
import { WithSnippets } from '@client/components/WithSnippets';
import { Slider } from '@client/components/Slider';
import { Empty } from '@client/components/Empty';
import { DropdownMenu } from '@client/components/DropdownMenu';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import clsx from 'clsx';
import { ModelSelect } from '@client/components/ModelSelect';
import { Checkbox } from '@client/components/Checkbox';

const LazyEmojiPopover = lazy(() => import('@client/components/EmojiPopover').then(m => ({ default: m.EmojiPopover })));

type PersonaFormProps = {
  title: string,
  defaultValue?: PersonaInSchemaType,
  loading?: boolean;
  onCancel?: VoidFunction,
  onSave?: (val: PersonaInSchemaType) => void,
}

const PersonaForm = ({ onCancel, onSave, loading, defaultValue, title }: PersonaFormProps) => {
  const { data: models } = useModels();

  const [personaName, setPersonaName] = useState(defaultValue?.name ?? '');
  const [personaProviderId, setPersonaProviderId] = useState(defaultValue?.providerId ?? null);
  const [personaModelId, setPersonaModelId] = useState(defaultValue?.modelId ?? null);
  const [personaAvatar, setPersonaAvatar] = useState(defaultValue?.avatar ?? '👩🏻‍🦰');
  const [personaSystem, setPersonaSystem] = useState(defaultValue?.system ?? null);
  const [personaTemperature, setPersonaTemperature] = useState(defaultValue?.temperature ?? null);
  const [isDefault, setIsDefault] = useState(defaultValue?.isDefault ?? false);

  return (<div className={styles.newPersonaWizard}>
    <div className={styles.formTitle}>{title}</div>

    <div className={styles.topRow}>
      <Suspense fallback={<Button className={styles.avatarButton} variant='borderless' size='large'>{personaAvatar}</Button>}>
        <LazyEmojiPopover
          side='bottom'
          onSelect={(emoji) => setPersonaAvatar(emoji)}
        >
          <Button className={styles.avatarButton} variant='borderless' size='large'>{personaAvatar}</Button>
        </LazyEmojiPopover>
      </Suspense>
      <WithLabel label='Name:' className={styles.nameWrapper}>
        <Input className={styles.input} placeholder='Assistant' value={personaName} onValueChange={setPersonaName} />
      </WithLabel>
    </div>

    <Switch
      checked={personaModelId !== null && personaProviderId !== null}
      onChange={(checked) => {
        if (checked) {
          const provider = models[0].provider;
          const model = models[0].models[0];
          setPersonaProviderId(provider.id);
          setPersonaModelId(model.id);
        } else {
          setPersonaProviderId(null);
          setPersonaModelId(null);
        }
      }}
    >
      Change default model
    </Switch>

    {(personaModelId !== null && personaProviderId !== null) && <ModelSelect
      withLabel={false}
      value={{ providerId: personaProviderId, modelId: personaModelId }}
      onChange={(newVal) => {
        setPersonaProviderId(newVal.providerId);
        setPersonaModelId(newVal.modelId);
      }}
    />}

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

    <Checkbox checked={isDefault} onCheckedChange={setIsDefault}>Set as default persona</Checkbox>

    <div className={styles.actions}>
      <Button
        variant='primary'
        size='large'
        loading={loading}
        onClick={() => onSave?.({
          name: personaName,
          avatar: personaAvatar,
          providerId: personaProviderId,
          modelId: personaModelId,
          system: personaSystem,
          temperature: personaTemperature,
          isDefault,
        })}
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
  const { id, avatar, name, isDefault } = props;
  const [isEditing, setIsEditing] = useState(false);

  const editPersona = useEditPersonaMutation();
  const deletePersona = useDeletePersonaMutation();

  return (<Card className={clsx(styles.persona, deletePersona.isPending && styles.ghost)} withScrollArea={false}>
    {isEditing && <PersonaForm
      title='Edit persona'
      defaultValue={props}
      onCancel={() => setIsEditing(false)}
      onSave={async (val) => {
        await editPersona.mutateAsync({ personaId: id, payload: val });
        setIsEditing(false);
      }}
      loading={editPersona.isPending}
    />}
    {!isEditing && <>
      <div className={styles.avatar}>{avatar}</div>
      <div className={styles.name}>{name}{isDefault && <span className={styles.defaultIndicator}>default</span>}</div>
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
            onSelect={() => deletePersona.mutate(id)}
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

  const sortedPersonas = useMemo(() => personas.toSorted((a, b) => b.createdAt - a.createdAt), [personas]);

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
          {sortedPersonas.length === 0 && <Empty text='No personas' />}
          {sortedPersonas.map(p => {
            return (<Persona key={p.id} {...p} />)
          })}
        </div>
      </div>
    </div>
  </Card>);
};
