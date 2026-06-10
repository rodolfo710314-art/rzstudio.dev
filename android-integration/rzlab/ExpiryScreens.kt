package dev.rzstudio.rzlab

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Pantallas de expiración (doc Bloque 4) — estética terminal de RZStudio.
 * ExpiryBlockScreen: bloqueo total cuando el token expiró o fue revocado.
 * ExpiryWarningBanner: aviso persistente cuando quedan ≤5 días.
 */

private val Copper = Color(0xFFC97352)
private val Bg     = Color(0xFF020202)

@Composable
fun ExpiryBlockScreen(message: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Bg)
            .padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "// ENTORNO BLOQUEADO",
            color = Color(0xFFEF4444),
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            letterSpacing = 2.sp,
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = message,
            color = Color(0xFF94A3B8),
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
        )
        Spacer(Modifier.height(24.dp))
        Text(
            text = "> solicita renovación respondiendo el correo\n> de seguimiento de rzstudio, o visita\n> rzstudio.dev/simbiosis para reportar feedback",
            color = Color(0xFF475569),
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            lineHeight = 18.sp,
        )
    }
}

@Composable
fun ExpiryWarningBanner(daysRemaining: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1C1209))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = "⚠ tu acceso beta expira en $daysRemaining días — revisa tu correo para renovar",
            color = Copper,
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
        )
    }
}
