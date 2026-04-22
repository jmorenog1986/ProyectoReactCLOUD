// components/users/UserTable.jsx
import { Button } from "../ui/Button";

export function UserTable({ users, onEdit, onDelete }) {
  //agregar 
   const handleDelete = (user) => {
    onDelete(user.documento);     
  };




  if (users.length === 0) {
    return (
      <div className="empty-state">
        No hay usuarios registrados aún.
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Documento</th>  
          <th>Nombres</th>
          <th>Apellidos</th> 
          <th>Correo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.documento}</td>
            <td>{user.nombres}</td>
            <td>{user.apellidos}</td>
            <td>{user.correo}</td>
            <td>
              <Button
                variant="secondary" size="sm"
                onClick={() => onEdit(user)}
              >
                Editar
              </Button>
              <Button variant="danger"    
              size="sm" 
              onClick={() => onDelete(user.documento)}>Eliminar</Button>
              
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}