import { useSession } from "../../context/SessionContext";
import styles from "./Auth.module.css";
import CenteredContainer from "../CenteredContainer/CenteredContainer";

function Auth() {
    const { screenLogIn, screenIn, screenOut, handleChange, handleRegister,
        handleVerify, handleLogin, isRegister, isVerifying, code, setCode, formData,
        setIsRegister, passwordStrength, strengthColor, strengthMessage, isLoadingLogin, isLoadingRegis, isLoadingVerif } = useSession();

    return (
        <CenteredContainer>
            <div className={styles.container}>
                <h2 className={styles.title}>{isVerifying ? "Verifica tu cuenta" : (screenLogIn ? "Inicia Sesión" : "Regístrate")}</h2>
                {isVerifying ? (
                    <form onSubmit={handleVerify} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="code">Código de verificación:</label>
                            <input
                                type="text"
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Código de verificación"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {isLoadingVerif ? (
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                                :
                                'Verificar'
                            }
                        </button>
                    </form>
                ) : (
                    <form onSubmit={screenLogIn ? handleLogin : handleRegister} className={styles.form}>
                        {isRegister && (
                            <>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Nombre:</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="surname">Apellido:</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phoneNumber">Teléfono:</label>
                                    <input
                                        type="text"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="address">Dirección:</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Correo Electrónico:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Contraseña:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                            {isRegister && (
                                <div className='d-flex flex-column gap-3'>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                    <div>
                                        <div 
                                            style={{
                                                height: "5px",
                                                width: passwordStrength,
                                                backgroundColor: `${strengthColor}`,
                                                borderRadius: "5px",
                                                transition: 'ease-in-out'
                                            }}>
                                        </div>
                                            <p
                                                style={{
                                                    textAlign: "center",
                                                    color: `${strengthColor}`,
                                                    height: "15px",
                                                    padding: "10px"
                                                }}
                                            >
                                                {strengthMessage}
                                            </p>
                                        
                                </div>
                            </div>
                        )}
                        <button type="submit" className={styles.submitButton}>
                            {screenLogIn ? "Iniciar Sesión" : "Crear Cuenta"}
                        </button>
                    </form>
                )}
                <p className={styles.toggleText}>
                    {screenLogIn ? (
                        <>
                            ¿No tienes cuenta?{" "}
                            <button onClick={() => { screenOut(); setIsRegister(true); }} type="button" className={styles.toggleButton}>
                                {isLoadingRegis ? (
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                )
                                    :
                                    'Regístrate'
                                }
                            </button>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes cuenta?{" "}
                                <button onClick={() => { screenIn(); setIsRegister(false); }} type="button" className={styles.toggleButton}>
                                    {isLoadingLogin ? (
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    )
                                        :
                                        'Iniciar Sesion'
                                    }
                            </button>
                        </>
                    )}
                </p>
            </div>
        </CenteredContainer>
    );
}

export default Auth;