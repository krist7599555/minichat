import * as buefy_dialog from './dialog.buefy';
import * as chat from './chat';

export async function create_room() {
  return chat.create_room(await buefy_dialog.prompt_room_title_create());
}
export async function invite_friend() {
  return chat.add_friend_to_room(await buefy_dialog.prompt_friend_userid());
}
export async function rename_room() {
  return chat.change_room_title(await buefy_dialog.prompt_room_title_rename());
}
