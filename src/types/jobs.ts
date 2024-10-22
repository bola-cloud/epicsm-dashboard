export interface Job {
  _id: string;
  createdAt: Date;
  datePublished: Date;
  finishDate?: Date | null;
  isLive: boolean;
  jobId: string;
  likeCount: number;
  link: string;
  linkTypeId: number;
  linkTypeName: string;
  maxCount: number;
  platform: string;
  country: string;
  status: string;
  type?: string | null;
  uid: string;
}
