import Paciente from '../models/Paciente.js';
import Doctor from '../models/Doctor.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config.js';
import { sendPasswordRecoveryEmail } from '../utils/email.js';

const authController = {};

/**
 * Registro de pacientes
 */
authController.registrarPacientes = async (req, res) => {
  try {
    const { nombre, correo, contrasena, fechaNacimiento, telefono, direccion } = req.body;

    console.log('📝 Registrando nuevo paciente:', correo);

    // Verificar si el correo ya existe
    const existingPaciente = await Paciente.findOne({ correo: correo.toLowerCase() });
    if (existingPaciente) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Verificar también en doctores
    const existingDoctor = await Doctor.findOne({ correo: correo.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Crear nuevo paciente
    const nuevoPaciente = new Paciente({
      nombre,
      correo: correo.toLowerCase(),
      contrasena,
      fechaNacimiento,
      telefono,
      direccion
    });

    await nuevoPaciente.save();

    console.log('✅ Paciente registrado exitosamente:', nuevoPaciente._id);

    // Generar token
    const token = jwt.sign(
      {
        id: nuevoPaciente._id.toString(),
        email: nuevoPaciente.correo,
        role: 'paciente',
        type: 'paciente',
        nombre: nuevoPaciente.nombre
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    // Configurar cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: {
        token,
        user: {
          id: nuevoPaciente._id,
          nombre: nuevoPaciente.nombre,
          correo: nuevoPaciente.correo,
          role: 'paciente'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error registrando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar paciente',
      error: error.message
    });
  }
};

/**
 * Inicio de sesión
 */
authController.iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    console.log('🔐 Intento de inicio de sesión:', correo);

    if (!correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    const normalizedEmail = correo.toLowerCase().trim();

    // Buscar primero en doctores
    let user = await Doctor.findOne({ correo: normalizedEmail, active: true }).select('+contrasena');
    let userType = 'doctor';

    // Si no es doctor, buscar en pacientes
    if (!user) {
      user = await Paciente.findOne({ correo: normalizedEmail, active: true }).select('+contrasena');
      userType = 'paciente';
    }

    if (!user) {
      console.log('❌ Usuario no encontrado o inactivo');
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    console.log('✅ Usuario encontrado:', { id: user._id, role: user.role });

    // Verificar contraseña
    const passwordMatch = await user.comparePassword(contrasena);

    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    // Actualizar último login
    await user.updateLastLogin();

    // Generar token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.correo,
        role: user.role,
        type: userType,
        nombre: user.nombre
      },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    // Configurar cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    console.log('✅ Inicio de sesión exitoso');

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          role: user.role,
          type: userType,
          fotoPerfilUrl: user.fotoPerfilUrl
        }
      }
    });
  } catch (error) {
    console.error('❌ Error en inicio de sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * Cerrar sesión
 */
authController.cerrarSesion = async (req, res) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    console.log('✅ Sesión cerrada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error cerrando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
};

/**
 * Solicitar código de recuperación de contraseña
 */
authController.solicitarCodigo = async (req, res) => {
  try {
    const { correo } = req.body;

    console.log('📧 Solicitud de recuperación de contraseña para:', correo);

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: 'El correo es requerido'
      });
    }

    const normalizedEmail = correo.toLowerCase().trim();

    // Buscar usuario en ambas colecciones
    let user = await Doctor.findOne({ correo: normalizedEmail });
    if (!user) {
      user = await Paciente.findOne({ correo: normalizedEmail });
    }

    // Por seguridad, siempre responder con éxito aunque el usuario no exista
    if (!user) {
      console.log('⚠️ Usuario no encontrado, pero respondiendo con éxito por seguridad');
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, recibirás un código de recuperación'
      });
    }

    // Generar código de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const recoveryExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar código en el usuario
    user.recoveryData = {
      code: recoveryCode,
      expires: recoveryExpires,
      attempts: 0
    };
    await user.save({ validateBeforeSave: false });

    // Enviar email con el código
    try {
      await sendPasswordRecoveryEmail(user.correo, recoveryCode, user.nombre);
      console.log('✅ Código de recuperación enviado');
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      // No revelar el error al usuario
    }

    res.status(200).json({
      success: true,
      message: 'Si el correo existe, recibirás un código de recuperación'
    });
  } catch (error) {
    console.error('❌ Error solicitando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al solicitar código de recuperación',
      error: error.message
    });
  }
};

/**
 * Verificar código de recuperación
 */
authController.verificarCodigo = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    console.log('🔍 Verificando código de recuperación');

    if (!correo || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Correo y código son requeridos'
      });
    }

    const normalizedEmail = correo.toLowerCase().trim();

    // Buscar usuario
    let user = await Doctor.findOne({ correo: normalizedEmail });
    if (!user) {
      user = await Paciente.findOne({ correo: normalizedEmail });
    }

    if (!user || !user.recoveryData || !user.recoveryData.code) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Verificar intentos
    if (user.recoveryData.attempts >= 3) {
      user.recoveryData = null;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: 'Demasiados intentos. Solicita un nuevo código'
      });
    }

    // Verificar expiración
    if (new Date() > new Date(user.recoveryData.expires)) {
      user.recoveryData = null;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: 'El código ha expirado. Solicita uno nuevo'
      });
    }

    // Verificar código
    if (user.recoveryData.code !== codigo) {
      user.recoveryData.attempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: 'Código incorrecto',
        attemptsLeft: 3 - user.recoveryData.attempts
      });
    }

    console.log('✅ Código verificado correctamente');

    res.status(200).json({
      success: true,
      message: 'Código verificado correctamente'
    });
  } catch (error) {
    console.error('❌ Error verificando código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar código',
      error: error.message
    });
  }
};

/**
 * Establecer nueva contraseña
 */
authController.nuevaContrasena = async (req, res) => {
  try {
    const { correo, codigo, nuevaContrasena } = req.body;

    console.log('🔒 Estableciendo nueva contraseña');

    if (!correo || !codigo || !nuevaContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Correo, código y nueva contraseña son requeridos'
      });
    }

    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const normalizedEmail = correo.toLowerCase().trim();

    // Buscar usuario
    let user = await Doctor.findOne({ correo: normalizedEmail });
    if (!user) {
      user = await Paciente.findOne({ correo: normalizedEmail });
    }

    if (!user || !user.recoveryData || user.recoveryData.code !== codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código inválido o expirado'
      });
    }

    // Verificar expiración
    if (new Date() > new Date(user.recoveryData.expires)) {
      user.recoveryData = null;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: 'El código ha expirado'
      });
    }

    // Actualizar contraseña
    user.contrasena = nuevaContrasena;
    user.recoveryData = null;
    await user.save();

    console.log('✅ Contraseña actualizada exitosamente');

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña',
      error: error.message
    });
  }
};

export default authController;
