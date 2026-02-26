import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react';
import { MdLanguage } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setUserLanguage } from '@/redux/slice/userSlice';
import userApi from '@/apis/userApi';
import { LocalStorage } from '@/constants/localStorage';
import { getLocalStorageObject } from '@/utils/localStorageService';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  const changeLanguage = async (locale: string) => {
    // Update Next.js locale routing
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale, shallow: false });

    // Update Redux store
    dispatch(setUserLanguage(locale));

    // Sync to backend in background only if user is logged in
    try {
      const accessToken = getLocalStorageObject(LocalStorage.ACCESS_TOKEN);
      if (accessToken && accessToken.length > 0) {
        await userApi.updateProfile({ language: locale });
      }
    } catch (error) {
      console.error('Failed to sync language to backend', error);
    }
  };

  const currentLocale = router.locale || 'en';
  const locales = [
    { code: 'en', label: 'English' },
    { code: 'vi', label: 'Tiếng Việt' },
  ];

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        leftIcon={<MdLanguage />}
        aria-label="Change language"
      >
        <HStack spacing={1}>
          <Text fontSize="sm" fontWeight="medium">
            {locales.find((l) => l.code === currentLocale)?.label || 'English'}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList>
        {locales.map((locale) => (
          <MenuItem
            key={locale.code}
            onClick={() => changeLanguage(locale.code)}
            bg={currentLocale === locale.code ? 'teal.50' : 'transparent'}
            color={currentLocale === locale.code ? 'teal.600' : 'inherit'}
            fontWeight={currentLocale === locale.code ? 'semibold' : 'normal'}
          >
            {locale.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitcher;
