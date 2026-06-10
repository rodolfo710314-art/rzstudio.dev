package dev.rzstudio.rzlab

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlin.math.sqrt

/**
 * Botón Fantasma RZS (doc §8.2) — shake-to-report.
 * Detecta una agitación del teléfono y levanta el formulario de feedback
 * que envía el reporte al webhook de RZStudio.
 *
 * Uso:
 *   val trigger = FeedbackTrigger(context) { mostrarFormularioFeedback() }
 *   trigger.start()  // en onResume
 *   trigger.stop()   // en onPause
 */
class FeedbackTrigger(
    context: Context,
    private val shakeThresholdG: Float = 2.6f, // configurable desde el manifiesto
    private val onShake: () -> Unit,
) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private var lastShakeMs = 0L

    companion object {
        private const val DEBOUNCE_MS = 1200L
    }

    fun start() {
        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    fun stop() = sensorManager.unregisterListener(this)

    override fun onSensorChanged(event: SensorEvent) {
        val (x, y, z) = event.values
        val gForce = sqrt(x * x + y * y + z * z) / SensorManager.GRAVITY_EARTH

        if (gForce > shakeThresholdG) {
            val now = System.currentTimeMillis()
            if (now - lastShakeMs > DEBOUNCE_MS) {
                lastShakeMs = now
                onShake()
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
}
