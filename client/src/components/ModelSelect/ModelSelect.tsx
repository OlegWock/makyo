import { useModels } from '@client/api';
import styles from './ModelSelect.module.scss';
import { useMemo } from 'react';
import { WithLabel } from '@client/components/WithLabel';
import { Select } from '@client/components/Select';
import { ProviderIcon } from '@client/components/icons';
import { ModelSchemaType } from '@shared/api';

export type ModelSelectProps = {
  withLabel?: boolean;
  value: { providerId: string, modelId: string };
  onChange: (newVal: { providerId: string, modelId: string }) => void;
};

type ModelOption = ModelSchemaType & { providerId: string, modelId: string };

export const ModelSelect = ({ value, onChange, withLabel = true }: ModelSelectProps) => {
  const { data: providers } = useModels();

  const options: ModelOption[] = useMemo(() => {
    return providers.flatMap(p => p.models.map(m => {
      return {
        ...m,
        providerId: p.provider.id,
        modelId: m.id,
      };
    }));
  }, [providers]);
  const selectedValue = options.find(o => o.providerId === value.providerId && o.modelId === value.modelId)!;

  const select = (<Select<ModelOption>
    triggerClassname={styles.modelSelect}
    options={options}
    value={selectedValue}
    onChange={(val) => onChange({ modelId: val.modelId, providerId: val.providerId })}
    getOptionKey={o => o.providerId + o.modelId}
    getOptionLabel={o => {
      return (<div className={styles.modelOption}>
        <div className={styles.iconWrapper}><ProviderIcon provider={o.providerId} /></div>
        {o.name}
      </div>)
    }}
  />);

  if (!withLabel) return select;

  return (<WithLabel label='Model:' className={styles.ModelSelect}>
    {select}
  </WithLabel>);
};
