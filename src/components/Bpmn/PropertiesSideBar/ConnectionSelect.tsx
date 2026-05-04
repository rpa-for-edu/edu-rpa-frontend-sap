import connectionApi from '@/apis/connectionApi';
import workspaceApi from '@/apis/workspaceApi';
import { AuthorizationProvider } from '@/interfaces/enums/provider.enum';
import { Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export interface ConnectionOptionsParams {
  value: string;
  onChange: (e: any) => void;
  provider: AuthorizationProvider;
  workspaceId?: string;
}

/**
 * Lấy workspaceId trực tiếp từ URL pathname.
 * Đáng tin cậy hơn useRouter() khi component nằm trong dynamic import (ssr: false).
 * Pattern: /workspace/{workspaceId}/...
 */
function getWorkspaceIdFromPath(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const match = window.location.pathname.match(/\/workspace\/([^\/]+)\//);
  return match ? match[1] : undefined;
}

export default function ConnectionOptions(props: ConnectionOptionsParams) {
  const { onChange, provider, value } = props;
  const [options, setOptions] = useState<any[]>([]);
  const handleCreateGoogleCredentialFilePath = (path: string) =>
    `${process.env['NEXT_PUBLIC_ROBOT_CREDENTIAL_FOLDER']}/${path}.json`;

  useEffect(() => {
    const workspaceId = getWorkspaceIdFromPath() || props.workspaceId;
    console.log('[ConnectionSelect] pathname:', window.location.pathname, '| workspaceId:', workspaceId, '| provider:', provider);

    const fetchData = async () => {
      try {
        if (workspaceId) {
          // Workspace: lấy connection của workspace
          const connections = await workspaceApi.getWorkspaceConnections(workspaceId, provider);
          console.log('[ConnectionSelect] workspace connections:', connections);
          setOptions(connections || []);
        } else {
          // User thông thường
          const connections = await connectionApi.queryConnections(provider);
          setOptions(connections);
        }
      } catch (error) {
        console.error('[ConnectionSelect] error:', error);
      }
    };
    fetchData();
  }, [provider, props.workspaceId]);

  return (
    <Select onChange={onChange} placeholder="Choose the connection" value={value}>
      {options.map((option) => (
        <option
          key={option.name || option.connectionKey}
          value={handleCreateGoogleCredentialFilePath(option.connectionKey)}
        >
          {option.name}
        </option>
      ))}
    </Select>
  );
}
