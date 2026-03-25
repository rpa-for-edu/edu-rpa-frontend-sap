import {
  Avatar,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdOutlinePerson, MdMail } from 'react-icons/md';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { userSelector } from '@/redux/selector';
import { LocalStorage } from '@/constants/localStorage';
import { useTranslation } from 'next-i18next';

const ProfileMenu = () => {
  const router = useRouter();
  const { t } = useTranslation('navbar');
  const user = useSelector(userSelector);

  const removeAuthToken = () => {
    localStorage.removeItem(LocalStorage.ACCESS_TOKEN);
    localStorage.removeItem(LocalStorage.PROCESS_LIST);
    localStorage.removeItem(LocalStorage.VARIABLE_LIST);
  };

  return (
    <Menu>
      <MenuButton py={2} transition="all 0.3s">
        <HStack>
          <Avatar size="sm" bg="gray.500" src={user.avatarUrl || undefined} />
        </HStack>
      </MenuButton>
      <MenuList
        bg={useColorModeValue('white', 'gray.900')}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <MenuDivider />

        <MenuItem onClick={() => router.push('/profile')}>
          <Flex align="center" justify="center">
            <MdOutlinePerson size={20} />
            <Text ml="10px">{t('profile')}</Text>
          </Flex>
        </MenuItem>
        {/* Invitations */}
        <MenuItem onClick={() => router.push('/invitation')}>
          <Flex align="center" justify="center">
            <MdMail size={20} />
            <Text ml="10px">{t('invitations')}</Text>
          </Flex>
        </MenuItem>
        <MenuDivider />
        <MenuItem
          onClick={() => {
            router.push('/');
            removeAuthToken();
          }}
        >
          <Flex align="center" justify="center">
            <MdMail size={20} />
            <Text ml="10px">{t('signOut')}</Text>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenu;
