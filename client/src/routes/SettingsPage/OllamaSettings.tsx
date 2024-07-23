import { useDeleteOllamaModelMutation, useOllamaModels } from "@client/api";
import styles from './SettingsPage.module.scss';
import { Card } from "@client/components/Card";
import { Button } from "@client/components/Button";
import { HiOutlineTrash } from "react-icons/hi2";
import { DropdownMenu } from "@client/components/DropdownMenu";
import { HiOutlineDotsVertical } from "react-icons/hi";
import clsx from "clsx";

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const OllamaSettings = () => {
  const { data: models } = useOllamaModels();

  const deleteModel = useDeleteOllamaModelMutation();

  return (<div className={styles.OllamaSettings}>
    <div className={styles.models}>
      {models.map(m => {
        const [name, tag] = m.name.split(':');
        return (<Card
          key={m.name}
          withScrollArea={false}
          className={clsx(styles.modelCard, deleteModel.isPending && deleteModel.variables === m.id && styles.ghost)}
        >
          <div>
            <span>{name}</span>
            <span className={styles.modelTag}>:{tag}</span>
            <span className={styles.modelSize}>{formatBytes(m.size)}</span>
          </div>

          <DropdownMenu
            menu={<>
              {/* TODO: maybe add a 'Details' button which will open modal with model details, like Modelfile */}
              <DropdownMenu.Item
                type='danger-with-confirmation'
                icon={<HiOutlineTrash />}
                onSelect={() => deleteModel.mutate(m.id)}
              >
                Delete
              </DropdownMenu.Item>
            </>}
          >
            <Button className={styles.menuButton} size='small' variant='borderless' icon={<HiOutlineDotsVertical />} />
          </DropdownMenu>
        </Card>);
      })}

      {/* TODO: on click show modal which allows to pull model from repo or create from modelfile */}
      {/* <Button size="large">Add models</Button> */}
    </div>
  </div>)
};
