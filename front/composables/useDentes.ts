import type { Dente, Face } from '~/types/odontograma';

export function useDentes() {
  const { get } = useApiService();
  
  const dentes = ref<Dente[]>([]);
  const faces = ref<Face[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all teeth
  async function fetchDentes() {
    loading.value = true;
    error.value = null;

    try {
      dentes.value = await get('dentes');
      return dentes.value;
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar dentes';
      console.error('Error fetching teeth:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Fetch all faces
  async function fetchFaces() {
    loading.value = true;
    error.value = null;

    try {
      faces.value = await get('dentes/faces');
      return faces.value;
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar faces';
      console.error('Error fetching faces:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  // Get teeth by quadrant
  function getDentesByQuadrante(quadrante: number) {
    return dentes.value
      .filter(dente => Number(dente.quadrante) === quadrante)
      .sort((a, b) => Number(a.posicao) - Number(b.posicao));
  }

  // Get face name by id
  function getFaceName(faceId: string) {
    const face = faces.value.find(f => f.id === faceId);
    return face ? face.descricao : faceId;
  }

  // Check if tooth is incisal (positions 1, 2)
  function isToothIncisal(denteId: number) {
    const dente = dentes.value.find(d => d.id === denteId);
    return dente && (Number(dente.posicao) === 1 || Number(dente.posicao) === 2);
  }

  return {
    dentes,
    faces,
    loading,
    error,
    fetchDentes,
    fetchFaces,
    getDentesByQuadrante,
    getFaceName,
    isToothIncisal
  };
}