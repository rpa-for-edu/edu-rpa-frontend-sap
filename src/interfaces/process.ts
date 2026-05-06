export interface ProcessResponse {
  _id: string;
  xml: string;
  variables: Record<string, any>;
  activities: any[];
}
