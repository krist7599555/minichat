import { DialogProgrammatic as Dialog } from 'buefy';

export function login() {
  return new Promise(res =>
    Dialog.prompt({
      title: `Minichat Login`,
      message: null,
      inputAttrs: {
        placeholder: 'ไม่กอบด้วย 0-9a-zA-Z'
      },
      confirmText: 'sign in',
      canCancel: true,
      trapFocus: true,
      onConfirm(userid) {
        res(userid);
      }
    })
  );
}

export function create_room() {
  return new Promise((res, rej) =>
    Dialog.prompt({
      title: `Create Chat Room`,
      message: null,
      inputAttrs: {
        placeholder: 'นครวัด หมากระจอก',
        maxlength: 30
      },
      canCancel: true,
      trapFocus: true,
      onConfirm(title) {
        res(title);
      },
      onCancel() {
        rej(new Error('Cancel Dialog'));
      }
    })
  );
}
export function invite_friend() {
  return new Promise(res =>
    Dialog.prompt({
      title: `Invite Friend`,
      message: null,
      inputAttrs: {
        placeholder: 'friend username'
      },
      confirmText: 'Invite',
      canCancel: true,
      trapFocus: true,
      onConfirm(userid) {
        res(userid);
      }
    })
  );
}

export function room_rename(old_room_name: string | null) {
  return new Promise((res, rej) =>
    Dialog.prompt({
      title: `Rename Chat Room`,
      message: null,
      inputAttrs: {
        placeholder: old_room_name || 'ชื่อกลุ่ม',
        maxlength: 30
      },
      canCancel: true,
      trapFocus: true,
      onConfirm(title) {
        res(title);
      },
      onCancel() {
        rej(new Error('Cancel Edit Dialog'));
      }
    })
  );
}
