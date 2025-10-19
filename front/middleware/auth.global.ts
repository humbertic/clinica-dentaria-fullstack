export default defineNuxtRouteMiddleware(async (to, from) => {
  // Public routes that don't require auth
  const publicRoutes = ["/login", "/register"];
  if (publicRoutes.includes(to.path)) return;

  const token = useCookie("token").value;
  if (!token) return navigateTo("/login");

  // Check if token is expired
  const tokenExpiresAtStr = useCookie("tokenExpiresAt").value;
  if (tokenExpiresAtStr) {
    const tokenExpiresAt = parseInt(tokenExpiresAtStr.toString());
    const now = Date.now();

    if (now >= tokenExpiresAt) {
      // Token is expired, clear everything and redirect to login
      useCookie("token").value = null;
      useCookie("expiresIn").value = null;
      useCookie("tokenExpiresAt").value = null;
      useState("user").value = null;
      return navigateTo("/login");
    }
  }

  const config = useRuntimeConfig();
  const userState = useState<any>("user", () => null);

  // Only fetch if we don't have user data yet or we're refreshing
  if (!userState.value || to.query.refresh) {
    try {
      const { data: user } = await useFetch<any>(
        `${config.public.apiBase}utilizadores/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!user.value || !user.value.perfil) {
        // Clear invalid session
        useCookie("token").value = null;
        useCookie("expiresIn").value = null;
        useCookie("tokenExpiresAt").value = null;
        userState.value = null;
        return navigateTo("/login");
      }

      // Update global user state
      userState.value = user.value;

      // Route protection based on role
      const perfil = user.value.perfil.perfil;
      if (to.path.startsWith("/doctor") && perfil !== "doctor") {
        return navigateTo("/");
      }
      if (to.path.startsWith("/master") && perfil !== "master_admin") {
        return navigateTo("/");
      }
      if (
        to.path.startsWith("/diretor") &&
        perfil !== "gerente" &&
        perfil !== "diretor"
      ) {
        return navigateTo("/");
      }
      if (to.path.startsWith("/frontdesk") && perfil !== "frontdesk") {
        return navigateTo("/");
      }
      if (to.path.startsWith("/assistant") && perfil !== "assistant") {
        return navigateTo("/");
      }
    } catch (error) {
      // Clear session on error
      useCookie("token").value = null;
      useCookie("expiresIn").value = null;
      useCookie("tokenExpiresAt").value = null;
      userState.value = null;
      return navigateTo("/login");
    }
  }
});
