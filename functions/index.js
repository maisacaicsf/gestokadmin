/**
 * excluirContaGestok — Cloud Function (chamável) para o painel ADMIN.
 *
 * Apaga por completo uma loja do Gestok:
 *  - todos os dados da loja (produtos, movimentações, chamados, operadores, usuários...)
 *  - os registros de acesso (coleção "acessos")
 *  - o LOGIN do cliente no Firebase Authentication
 *
 * Só funciona para quem tem o documento admins/{uid} ativo (você, no painel).
 * Nunca apaga a conta de um administrador.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

async function ehAdmin(uid) {
  const doc = await admin.firestore().collection('admins').doc(uid).get();
  return doc.exists && doc.data().ativo !== false;
}

exports.excluirContaGestok = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Faça login no painel.');
  }
  if (!(await ehAdmin(context.auth.uid))) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem excluir lojas.');
  }

  const lojaId = String((data && data.lojaId) || '').trim();
  if (!lojaId || lojaId.includes('/')) {
    throw new functions.https.HttpsError('invalid-argument', 'Loja inválida.');
  }

  const db = admin.firestore();
  const lojaRef = db.collection('lojas').doc(lojaId);
  const lojaSnap = await lojaRef.get();
  const loja = lojaSnap.exists ? lojaSnap.data() : {};
  const donoUid = loja.donoUid || null;

  // Descobre todos os logins ligados à loja (dono + documentos em usuarios, cujo ID é o uid).
  const uids = new Set();
  if (donoUid) uids.add(donoUid);
  const usuarios = await lojaRef.collection('usuarios').get();
  usuarios.forEach((d) => uids.add(d.id));

  // Proteção: nunca apagar login de administrador.
  for (const uid of [...uids]) {
    if (await ehAdmin(uid)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Esta loja pertence a uma conta de administrador e não pode ser excluída.'
      );
    }
  }

  // Registros de acesso (login por código + usuário).
  const acessos = new Map();
  const porLoja = await db.collection('acessos').where('lojaId', '==', lojaId).get();
  porLoja.forEach((d) => acessos.set(d.id, d.ref));
  for (const uid of uids) {
    const porUid = await db.collection('acessos').where('uid', '==', uid).get();
    porUid.forEach((d) => acessos.set(d.id, d.ref));
  }

  // Apaga a loja com todas as subcoleções (inclui chamados/mensagens).
  await db.recursiveDelete(lojaRef);
  for (const ref of acessos.values()) {
    await ref.delete();
  }

  // Apaga os logins. "usuário não encontrado" não é erro (já foi removido).
  let loginsRemovidos = 0;
  const lista = [...uids];
  for (let i = 0; i < lista.length; i += 1000) {
    const resultado = await admin.auth().deleteUsers(lista.slice(i, i + 1000));
    loginsRemovidos += resultado.successCount;
    resultado.errors.forEach((e) => {
      console.warn('Falha ao apagar login:', e.index, e.error && e.error.code);
    });
  }

  return { ok: true, loginsRemovidos };
});
