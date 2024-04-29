import PuffLoader from "react-spinners/PuffLoader";
import styles from './Loading.module.scss';

export type LoadingProps = {

};

export const Loading = ({ }: LoadingProps) => {
  return (<div className={styles.Loading}>
    <div className={styles.wrapper}>
      <PuffLoader color='var(--gray-6)' size='25rem' />
      <div className={styles.text}>Loading...</div>
    </div>
  </div>);
};
