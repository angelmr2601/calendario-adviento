# Conectar el calendario con Supabase

Con Supabase conectado:

- **Las sorpresas** (textos, preguntas, vales…) se leen de la base de datos. Las editas en `/admin` y se ven en la web publicada al momento, sin volver a desplegar.
- **Las fotos** viven en un bucket privado (`memories`) y solo se sirven cuando su día ya está desbloqueado.
- **El progreso** (puertas abiertas y vales canjeados) se guarda en el servidor: se sincroniza entre móviles y tú lo ves en `/admin`.

Si no pones las variables de entorno, todo funciona como antes (surprises.json y progreso en el navegador).

## Pasos

1. **Crea un proyecto** en <https://supabase.com> (elige una región europea).
2. **SQL Editor → New query**: pega el contenido de `supabase/configuracion.sql` y pulsa *Run*. Se puede ejecutar más de una vez sin problema. Crea las tablas, la función de progreso, una vista de resumen y el bucket privado de fotos.
3. **Project Settings → API Keys**: copia la *Project URL* y la **Secret key** (`sb_secret_...`). Si tu proyecto solo muestra la clave antigua `service_role`, también sirve.
4. Copia `.env.example` como `.env.local` y rellénalo.
5. Ejecuta `npm install` y después **`npm run importar`**. Sube tus 24 sorpresas de `src/data/surprises.json` y las fotos de `private/memories` (o `public/memories`).
   - Por defecto solo añade lo que falta, así que no pisa lo que ya hayas editado online.
   - `npm run importar -- --forzar` sobrescribe también lo existente.
6. `npm run dev` y abre `/admin`: debe poner *"Los cambios se guardan en Supabase"*.
7. **En Vercel**: Settings → Environment Variables, añade `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SECRET_KEY` y vuelve a desplegar.

## Cómo ver su progreso

- En `/admin` (en tu ordenador) hay un panel **Progreso** con las puertas abiertas y los vales canjeados, con fecha y hora.
- O en Supabase → Table Editor → vista **`advent_resumen`**.

## Seguridad y cosas que conviene saber

- `SUPABASE_SECRET_KEY` **no puede llevar el prefijo `NEXT_PUBLIC_`** ni subirse a GitHub (`.env*` ya está en `.gitignore`). Salta las políticas RLS: solo la usa el servidor. Si se filtra, regenérala en Supabase.
- Las tablas tienen RLS activado sin políticas públicas: desde el navegador no se puede leer ni escribir nada directamente.
- El contenido sigue protegido por fecha en el servidor: no se envía al navegador ninguna sorpresa ni foto de un día bloqueado.
- **El progreso no tiene login**: quien tenga el enlace comparte el mismo progreso (está pensado para una sola persona). Solo se pueden registrar puertas ya desbloqueadas, y los vales solo en días de tipo vale. No compartas el enlace.
- El modo `?preview=true` nunca escribe en Supabase.
- Lo guardado en Supabase tiene prioridad sobre `surprises.json`; los días que falten en la base de datos se completan con el JSON.
- Si las variables están puestas pero aún no has ejecutado el SQL (o Supabase no responde), la web lo anota en la consola del servidor y sigue funcionando en modo local.
- `/admin` sigue siendo **solo local** (localhost con `npm run dev`), pero lo que guardas va a la base de datos real. No se ha añadido edición con login desde la web publicada.
- Las fotos se localizan por nombre de archivo (`/memories/recuerdo-xxx.jpg` → bucket `memories`, objeto `recuerdo-xxx.jpg`).
- `supabase/crear-panel.sql` (el de administradores con login) ya no hace falta para esto. No molesta si lo dejas.
