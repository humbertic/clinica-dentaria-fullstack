import { ref } from "vue";
import type {
  UtilizadorCreate,
  UtilizadorAdminUpdate,
  LoginRequest,
  UtilizadorUpdate,
  AtribuirPerfilRequest,
  AtribuirClinicaRequest,
  UtilizadorResponse,
  TokenResponse,
  AlterarSenhaRequest,
} from "~/types/utilizador";
import { useApiService } from "@/composables/apiService";

export function useUtilizadores() {
  const { get, post, put } = useApiService();
  const users = ref<UtilizadorResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers() {
    loading.value = true;
    error.value = null;
    try {
      users.value = await get("utilizadores");
    } catch (e: any) {
      error.value = e.message || String(e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMedicosByClinica(clinicaId: number) {
    loading.value = true;
    error.value = null;
    try {
      const medicos = await get(`utilizadores/clinica/${clinicaId}/medicos`);
      users.value = medicos;
      return medicos;
    } catch (e: any) {
      error.value = e.message || String(e);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      return await get(`utilizadores/${id}`);
    } catch (e: any) {
      error.value = e.message || String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createUser(data: UtilizadorCreate) {
    loading.value = true;
    error.value = null;
    try {
      const u = await post("utilizadores", data);
      users.value.push(u);
      return u;
    } catch (e: any) {
      error.value = e.message || String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(
    id: number,
    data: UtilizadorUpdate | UtilizadorAdminUpdate
  ) {
    loading.value = true;
    error.value = null;
    try {
      const u = await put(`utilizadores/${id}`, data);
      const idx = users.value.findIndex((x) => x.id === id);
      if (idx !== -1) users.value[idx] = u;
      return u;
    } catch (e: any) {
      error.value = e.message || String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  //   async function deleteUser(id: number) {
  //     loading.value = true
  //     error.value = null
  //     try {
  //       await del(`utilizadores/${id}`)
  //       users.value = users.value.filter(x => x.id !== id)
  //       return true
  //     } catch (e: any) {
  //       error.value = e.message || String(e)
  //       return false
  //     } finally {
  //       loading.value = false
  //     }
  //   }

  //   async function login(credentials: LoginRequest) {
  //     try {
  //       return await post<TokenResponse>('auth/login', credentials)
  //     } catch (e: any) {
  //       throw e
  //     }
  //   }

  //   async function assignPerfil(id: number, data: AtribuirPerfilRequest) {
  //     return put<UtilizadorResponse>(`utilizadores/${id}/perfil`, data)
  //   }

  //   async function assignClinicas(id: number, data: AtribuirClinicaRequest) {
  //     return put<UtilizadorResponse>(`utilizadores/${id}/clinicas`, data)
  //   }

  async function changePassword(id: number, data: AlterarSenhaRequest) {
    return put(`utilizadores/${id}/senha`, data);
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    fetchMedicosByClinica,
    createUser,
    updateUser,
    changePassword,
  };
}
