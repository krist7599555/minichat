import { DialogProgrammatic as Dialog, ToastProgrammatic as Toast } from 'buefy';

export function prompt_username() {
  return new Promise<string>((res, rej) =>
    Dialog.prompt({
      title: `Minichat Login`,
      message: null,
      inputAttrs: {
        placeholder: 'ไม่กอบด้วย 0-9a-zA-Z'
      },
      confirmText: 'sign in',
      canCancel: true,
      trapFocus: true,
      onCancel: () => rej(new Error('cancel prompt login')),
      onConfirm(userid) {
        if (userid.trim()) {
          res(userid.trim());
        } else {
          rej(new Error('username is empty'));
        }
      }
    })
  );
}

export function prompt_room_title_create() {
  return new Promise<string>((res, rej) =>
    Dialog.prompt({
      title: `Create Chat Room`,
      message: null,
      inputAttrs: {
        placeholder: 'นครวัด หมากระจอก',
        maxlength: 30
      },
      canCancel: true,
      trapFocus: true,
      onCancel: () => rej(new Error('cancel change room')),
      onConfirm(title) {
        if (title.trim()) {
          res(title.trim());
        } else {
          rej(new Error('username is empty'));
        }
      }
    })
  );
}
export function prompt_friend_userid() {
  return new Promise<string>((res, rej) =>
    Dialog.prompt({
      title: `Invite Friend`,
      message: null,
      inputAttrs: {
        placeholder: 'friend username'
      },
      confirmText: 'Invite',
      canCancel: true,
      trapFocus: true,
      onCancel: () => rej(new Error('not input friend')),
      onConfirm(userid) {
        if (userid.trim()) {
          res(userid.trim());
        } else {
          rej(new Error('username is empty'));
        }
      }
    })
  );
}

export function prompt_room_title_rename(old_room_name: string | null = null) {
  return new Promise<string>((res, rej) =>
    Dialog.prompt({
      title: `Rename Chat Room`,
      message: null,
      inputAttrs: {
        placeholder: old_room_name || 'ชื่อกลุ่ม',
        maxlength: 30
      },
      canCancel: true,
      trapFocus: true,
      onCancel: () => rej(new Error('not edit room title')),
      onConfirm(title) {
        if (title.trim()) {
          res(title.trim());
        } else {
          rej(new Error('title is empty'));
        }
      }
    })
  );
}
export const toast = Toast.open;
