
export interface UserData {
  nama: string;
  link: string;
  deskripsi: string;
}

export enum Status {
  IDLE = 'IDLE',
  REDIRECTING = 'REDIRECTING',
  NOT_FOUND = 'NOT_FOUND',
  HOME = 'HOME',
}
