// for friendsList
export interface Friend {
  FacebookId: string,
  name: string,
  photoUrl: string
}

export interface InvitedFriend extends Friend{
  status: number,
}
