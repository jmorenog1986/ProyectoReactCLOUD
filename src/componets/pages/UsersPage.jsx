// pages/UsersPage.jsx
import { useState }         from "react";
import { RegisterForm }    from "../users/RegisterForm";
import { UserTable }       from "../users/UserTable";
import { EditModal }       from "../users/EditModal";
import { ConfirmDialog }   from "../ui/ConfirmDialog";

export function UsersPage() {
  // ── Estado global ─────────────────────────────────────
  const [users,    setUsers]    = useState([]);
  const [editUser, setEditUser] = useState(null);  // usuario en edición
  const [deleteId, setDeleteId] = useState(null);  // id a eliminar

  // ── CREATE ────────────────────────────────────────────
  const handleCreate = (newUser) =>
    setUsers((prev) => [...prev, newUser]);

  // ── UPDATE ────────────────────────────────────────────
  const handleSave = (updated) =>
    setUsers((prev) =>
      prev.map((u) => u.id === updated.id ? updated : u)
    );

  // ── DELETE ────────────────────────────────────────────
 const handleDelete = async (documento) => {
    try {
      const res = await fetch(`https://reactcompensar-env.eba-p272mu4y.us-east-2.elasticbeanstalk.com/api/usuarios/${documento}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.documento !== documento));
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  return (
    <div>
      {/* CREATE */}
      <RegisterForm onUserCreated={handleCreate} />

      {/* READ */}
      <UserTable
        users={users}
        onEdit={(user) => setEditUser(user)}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* UPDATE — solo si hay un usuario seleccionado */}
      {editUser && (
        <EditModal
          user={editUser}
          onSave={handleSave}
          onClose={() => setEditUser(null)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Eliminar usuario"
          message="Esta acción no se puede deshacer."
          onConfirm={() => {          
            handleDelete(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}