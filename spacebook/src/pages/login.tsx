import React from "react";
import { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";



export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorNombre, setErrorNombre] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [mensajeError, setMensajeError] = useState("")

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorNombre(false);
    setErrorPassword(false);
    setMensajeError("");

    let hayError = false;

    if (username === "") {
        setErrorNombre(true);
        hayError = true;
    }

    if (password === "") {
        setErrorPassword(true);
        hayError = true;
    }

    if (hayError) return;

    const usuario = await AuthService.HandleLogin(username, password);

    if(!usuario){
      setMensajeError("Usuario o password invalidos")
      return;
    }

    console.log('Usuario logueado', usuario)
  
    const { data: profile } = await AuthService.supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", usuario.id)
      .single();

    if (profile?.is_admin) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
    };

  return (

    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form className="form-group" onSubmit={handleSubmit}>
            <div>
                <label className="label">Email:</label>
                <input
                className={errorNombre ? "input-error" : "input"}
                type="text"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
                {errorNombre && <p className="error-message"> El campo de usuario es necesario</p>}
            </div>
            <div>
                <label className="label">Contraseña:</label>
                <input
                className={errorPassword ? "input-error" : "input"}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                {errorPassword && <p className="error-message"> El campo de contraseña es necesario</p>}
            </div>
            <button>Log In</button>
                {mensajeError && <p className="error-message">{mensajeError}</p>}
        </form>
        <div className="helper">
          ¿No tienes cuenta? <a href="/register">Regístrate</a>
        </div>
      </div>
    </div>
  );
}