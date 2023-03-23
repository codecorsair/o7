export interface ICronjob {
  name: string;
  description: string;
  cron: string;
  task: () => Promise<void>;
}
