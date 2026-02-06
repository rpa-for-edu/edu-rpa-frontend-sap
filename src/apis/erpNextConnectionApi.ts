import apiBase from './config';

export interface TestERPNextConnectionResponse {
  message: string;
  isValid: boolean;
}

const testERPNextConnection = async (
  name: string
): Promise<TestERPNextConnectionResponse> => {
  return await apiBase
    .get(`${process.env.NEXT_PUBLIC_DEV_API}/connection/erpnext/test`, {
      params: { name },
    })
    .then((res: any) => {
      return res.data;
    });
};

export interface CreateERPNextConnectionDto {
  baseUrl: string;
  token: string;
  name?: string;
}

export interface ERPNextConnectionResponse {
  message: string;
  connection: {
    provider: string;
    name: string;
    connectionKey: string;
    createdAt: string;
  };
}

const createERPNextConnection = async (
  data: CreateERPNextConnectionDto
): Promise<ERPNextConnectionResponse> => {
  return await apiBase
    .post(`${process.env.NEXT_PUBLIC_DEV_API}/connection/erpnext`, data)
    .then((res: any) => {
      return res.data;
    });
};

const createWorkspaceERPNextConnection = async (
  workspaceId: string,
  data: CreateERPNextConnectionDto
): Promise<ERPNextConnectionResponse> => {
  return await apiBase
    .post(`${process.env.NEXT_PUBLIC_DEV_API}/auth/workspace/${workspaceId}/erpnext`, data)
    .then((res: any) => {
      return res.data;
    });
};

const erpNextConnectionApi = {
  testERPNextConnection,
  createERPNextConnection,
  createWorkspaceERPNextConnection,
};

export default erpNextConnectionApi;
