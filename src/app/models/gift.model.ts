export interface Gift {
  id: string;
  name: string;
  urls?: string[];
  /** Guest session ID of whoever added this gift, if added by a guest (not the owner). */
  addedBy?: string;
}
