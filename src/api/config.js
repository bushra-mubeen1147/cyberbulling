const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    return `${currentProtocol}//${currentHost}:8000`;
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getBackendUrl();
