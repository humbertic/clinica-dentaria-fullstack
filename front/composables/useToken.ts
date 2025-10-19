import { ref, onMounted, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'

export function useTokenExpiration() {
  const tokenExpiresAt = ref<number | null>(null)
  const warningShown = ref(false)
  const warningTimeoutId = ref<NodeJS.Timeout | null>(null)
  const expirationTimeoutId = ref<NodeJS.Timeout | null>(null)

  // Time before expiration to show warning (in milliseconds)
  const WARNING_BEFORE_EXPIRY = 60000 // 1 minute

  // Get token expiration from cookies
  const updateTokenExpiration = () => {
    const token = useCookie('token').value
    const expiresInCookie = useCookie('expiresIn').value
    const tokenExpiresAtCookie = useCookie('tokenExpiresAt').value
    
    if (!token) {
      tokenExpiresAt.value = null
      return
    }
    
    // If we have a stored expiration time, use it
    if (tokenExpiresAtCookie) {
      tokenExpiresAt.value = parseInt(tokenExpiresAtCookie.toString())
      return
    }
    
    // If we don't have an expiration time but have expiresIn, calculate it
    if (expiresInCookie) {
      const expiresInSeconds = parseInt(expiresInCookie.toString())
      const now = Date.now()
      tokenExpiresAt.value = now + (expiresInSeconds * 1000)
      
      // Store it for future reference
      useCookie('tokenExpiresAt').value = tokenExpiresAt.value.toString()
      return
    }
    
    // If we have neither, we can't determine expiration
    tokenExpiresAt.value = null
  }

  // Setup warning and expiration timers
  const setupTimers = () => {
    clearTimers()
    
    if (!tokenExpiresAt.value) return
    
    const now = Date.now()
    const timeUntilExpiry = tokenExpiresAt.value - now
    
    if (timeUntilExpiry <= 0) {
      // Token already expired
      handleExpiration()
      return
    }
    
    // Set timer for warning
    const timeUntilWarning = timeUntilExpiry - WARNING_BEFORE_EXPIRY
    if (timeUntilWarning > 0) {
      warningTimeoutId.value = setTimeout(() => {
        showWarning()
      }, timeUntilWarning)
    } else if (!warningShown.value) {
      // If we're already in the warning period but warning not shown
      showWarning()
    }
    
    // Set timer for actual expiration
    expirationTimeoutId.value = setTimeout(() => {
      handleExpiration()
    }, timeUntilExpiry)
  }

  // Clear all timers
  const clearTimers = () => {
    if (warningTimeoutId.value) {
      clearTimeout(warningTimeoutId.value)
      warningTimeoutId.value = null
    }
    
    if (expirationTimeoutId.value) {
      clearTimeout(expirationTimeoutId.value)
      expirationTimeoutId.value = null
    }
  }

  // Show expiration warning
  const showWarning = () => {
    if (warningShown.value) return
    
    warningShown.value = true
    const timeLeft = Math.floor((tokenExpiresAt.value! - Date.now()) / 1000)
    
    // Use sonner toast for the warning
    toast("Sessão a expirar", {
      description: `A sua sessão vai expirar em ${timeLeft} segundos.`,
      action: {
        label: "Renovar Sessão",
        onClick: () => refreshToken()
      },
      duration: Math.min(timeLeft * 1000, 10000) // Show for max 10 seconds
    })
  }

  // Handle token expiration
  const handleExpiration = () => {
    clearTimers()
    
    // Clear token and user state
    const tokenCookie = useCookie('token')
    const expiresInCookie = useCookie('expiresIn')
    const tokenExpiresAtCookie = useCookie('tokenExpiresAt')
    
    tokenCookie.value = null
    expiresInCookie.value = null
    tokenExpiresAtCookie.value = null
    
    // Reset the user state
    const userState = useState('user')
    userState.value = null
    
    // Notify user
    toast.error("Sessão expirada", {
      description: "A sua sessão expirou. Por favor, faça login novamente."
    })
    
    // Redirect to login page
    navigateTo('/login')
  }

  // Refresh token
  const refreshToken = async () => {
    try {
      warningShown.value = false
      clearTimers()
      
      // Call your refresh token endpoint
      const config = useRuntimeConfig()
      type RefreshTokenResponse = {
        access_token: string
        expires_in: number
      }
      const { data } = await useFetch<RefreshTokenResponse>(`${config.public.apiBase}utilizadores/refresh-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useCookie('token').value}`
        }
      })
      
      if (data.value) {
        // Update token and expiration
        const tokenCookie = useCookie('token')
        const expiresInCookie = useCookie('expiresIn')
        const tokenExpiresAtCookie = useCookie('tokenExpiresAt')
        
        tokenCookie.value = data.value.access_token
        expiresInCookie.value = data.value.expires_in.toString()
        
        // Calculate new expiration time
        const now = Date.now()
        tokenExpiresAt.value = now + (data.value.expires_in * 1000)
        tokenExpiresAtCookie.value = tokenExpiresAt.value.toString()
        
        // Show success message
        toast.success("Sessão renovada", {
          description: "A sua sessão foi renovada com sucesso."
        })
        
        // Setup new timers
        setupTimers()
        
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to refresh token:', error)
      
      // Show error message
      toast.error("Erro", {
        description: "Não foi possível renovar a sua sessão."
      })
      
      return false
    }
  }

  // Setup on mount
  onMounted(() => {
    updateTokenExpiration()
    setupTimers()

    // Handle visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTokenExpiration()
        setupTimers()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup on unmount
    onBeforeUnmount(() => {
      clearTimers()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
  })

  return {
    tokenExpiresAt,
    warningShown,
    refreshToken,
    updateTokenExpiration,
    setupTimers,
    clearTimers
  }
}