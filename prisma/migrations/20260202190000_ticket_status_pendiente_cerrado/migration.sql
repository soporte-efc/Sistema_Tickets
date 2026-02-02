-- Unificar estados de tickets: solo pendiente y cerrado
-- Los tickets con en_proceso, completado o rechazado pasan a cerrado
UPDATE tickets
SET status = 'cerrado'
WHERE status IN ('en_proceso', 'completado', 'rechazado');
