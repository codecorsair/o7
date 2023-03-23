export interface ICronjob {
  disabled?: boolean;
  name: string;
  description: string;
  cron: string;
  task: () => Promise<void>;
}
