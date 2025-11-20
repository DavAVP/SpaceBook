import React, { useState } from "react";
import "../styles/login.css";
import { AuthService } from "../services/auth.service";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorEmail, setErrorEmail] = useState(false);
    const [errorPassword, setErrorPassword] = useState(false);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorEmail(false);
    setErrorPassword(false);
    setMensajeError("");
    setMensajeExito("");

    let hayError = false;
    if (email.trim() === "") {
        setErrorEmail(true);
        hayError = true;
    }
    if (password.trim() === "") {
        setErrorPassword(true);
        hayError = true;
    }
    if (hayError) return;
    const usuario = AuthService.HandleSingUp(email,password);
    if (!usuario) {
        setMensajeError("No se pudo registrar el usuario. Intenta con otro correo.");
        return;
    }
    console.log("Usuario registrado:", usuario);
    setMensajeExito("Usuario registrado correctamente")
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Registro</h1>
                <form className="form-group" onSubmit={handleSubmit}>
                    <div>
                            <label className="label">Correo electrónico:</label>
                            <input
                            className={errorEmail ? "input-error" : "input"}
                            type="email"
                            placeholder="Tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                            {errorEmail && (<p className="error-message">El correo es obligatorio</p>)}
                    </div>
                    <div>
                        <label className="label">Contraseña:</label>
                        <input
                        className={errorPassword ? "input-error" : "input"}
                        type="password"
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                        {errorPassword && (<p className="error-message">La contraseña es obligatoria</p>)}
                    </div>
                    {mensajeError && (<p className="error-message">{mensajeError}</p>)}
                    {mensajeExito && (<p className="success-message">{mensajeExito}</p>)}
                    <button>Registrarse</button>
                </form>
                <div className="helper">
                    ¿Ya tienes cuenta? <a href="/">Inicia sesión</a>
                </div>
            </div>
        </div>
    );
}
