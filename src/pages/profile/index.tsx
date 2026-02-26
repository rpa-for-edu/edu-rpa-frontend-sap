import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Avatar,
  Text,
  Stack,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Heading,
  Divider,
  Select,
  Spinner,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { MdEdit, MdLanguage, MdPerson, MdSave } from 'react-icons/md';
import SidebarContent from '@/components/Sidebar/SidebarContent/SidebarContent';
import userApi from '@/apis/userApi';
import { setUser, setUserLanguage, setUserAvatarUrl } from '@/redux/slice/userSlice';
import { userSelector } from '@/redux/selector';
import { useDispatch, useSelector } from 'react-redux';
import { GetServerSideProps } from 'next';
import { getServerSideTranslations } from '@/utils/i18n';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation('profile');
  const toast = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(userSelector);

  const [userName, setUserName] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isLoadingUpdateProfile, setIsLoadingUpdateProfile] = useState<boolean>(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(user.language || 'vi');
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string>('');

  const hiddenFileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserName(user.name);
    setSelectedLanguage(user.language || 'vi');
  }, [user]);

  // ─── 1. Avatar Upload ─────────────────────────────────────────
  const handleAvatarClick = () => {
    hiddenFileInput.current?.click();
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviewAvatarUrl(previewUrl);
    setIsLoadingAvatar(true);

    try {
      const userFromApi = await userApi.uploadAvatar(file);
      // Use the preview URL locally since S3 URL may be cached by CDN
      dispatch(setUser({ ...userFromApi, avatarUrl: previewUrl }));
      toast({
        title: t('messages.avatarUpdated'),
        description: t('messages.avatarUpdatedDescription'),
        position: 'top-right',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Revert preview on failure
      setPreviewAvatarUrl('');
      toast({
        title: t('messages.avatarFailed'),
        description: t('messages.avatarFailedDescription'),
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingAvatar(false);
    }
  };

  // ─── 2. Update Profile Name ────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!userName || userName.trim() === '') return;
    if (userName === user.name) return;

    setIsLoadingUpdateProfile(true);
    try {
      const userFromApi = await userApi.updateProfile({ name: userName });
      dispatch(setUser(userFromApi));
      toast({
        title: t('messages.profileUpdated'),
        description: t('messages.profileUpdatedDescription'),
        position: 'top-right',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('messages.failedToUpdate'),
        description: t('messages.failedToUpdateDescription'),
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingUpdateProfile(false);
    }
  };

  // ─── 3. Language Change ────────────────────────────────────────
  const handleLanguageChange = async (newLang: string) => {
    setSelectedLanguage(newLang);

    // Immediately change the UI language via next-i18next router
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLang, shallow: false });

    // Update Redux store
    dispatch(setUserLanguage(newLang));

    // Sync to backend in the background
    try {
      await userApi.updateProfile({ language: newLang });
      toast({
        title: t('messages.languageUpdated'),
        description: t('messages.languageUpdatedDescription'),
        position: 'top-right',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Silently fail — the locale already changed on FE
      console.error('Failed to sync language to backend', error);
    }
  };

  // Get display avatar URL (prefer preview, fallback to store)
  // Filter out invalid URLs (empty string, s3:// protocol, etc.)
  const getValidImageUrl = (url: string) => {
    if (!url) return undefined;
    if (url.startsWith('s3://')) return undefined;
    return url;
  };
  const displayAvatarUrl = getValidImageUrl(previewAvatarUrl) || getValidImageUrl(user.avatarUrl);

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarContent>
      <Box maxW="700px" mx="auto" py={6} px={4}>
        {/* Page Header */}
        <Heading size="lg" mb={1}>
          {t('myProfile')}
        </Heading>
        <Text color="gray.500" mb={6}>
          {t('editProfile')}
        </Text>

        {/* ─── Section 1: Avatar ─────────────────────────────────── */}
        <Box
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          overflow="hidden"
          mb={6}
          boxShadow="sm"
        >
          {/* Gradient header strip */}
          <Box h="80px" bgGradient="linear(to-r, teal.400, teal.600)" />

          <Flex px={6} pb={6} mt="-40px" align="flex-end" gap={4}>
            {/* Avatar with hover overlay */}
            <Box
              position="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              cursor="pointer"
              onClick={handleAvatarClick}
            >
              <Avatar
                size="xl"
                src={displayAvatarUrl || undefined}
                name={user.name}
                bg="teal.500"
                color="white"
                border="4px solid white"
                boxShadow="md"
              />

              {/* Loading spinner overlay */}
              {isLoadingAvatar && (
                <Flex
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  bg="blackAlpha.600"
                  borderRadius="full"
                  justify="center"
                  align="center"
                  border="4px solid white"
                >
                  <Spinner color="white" size="lg" />
                </Flex>
              )}

              {/* Hover edit overlay */}
              {isHovered && !isLoadingAvatar && (
                <Flex
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  bg="blackAlpha.500"
                  borderRadius="full"
                  justify="center"
                  align="center"
                  border="4px solid white"
                  transition="all 0.2s"
                >
                  <Icon as={MdEdit} color="white" boxSize={6} />
                </Flex>
              )}

              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onAvatarChange}
                ref={hiddenFileInput}
              />
            </Box>

            {/* User info next to avatar */}
            <Box pb={1}>
              <Text fontWeight="bold" fontSize="xl">
                {user.name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {user.email}
              </Text>
            </Box>
          </Flex>

          <Flex px={6} pb={4}>
            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              leftIcon={<MdEdit />}
              onClick={handleAvatarClick}
              isLoading={isLoadingAvatar}
            >
              {t('changeAvatar')}
            </Button>
          </Flex>
        </Box>

        {/* ─── Section 2: Personal Information ───────────────────── */}
        <Box
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          p={6}
          mb={6}
          boxShadow="sm"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={MdPerson} color="teal.500" boxSize={5} />
            <Heading size="md">{t('personalInformation')}</Heading>
          </Flex>
          <Divider mb={4} />

          <Stack spacing={4}>
            <FormControl>
              <FormLabel htmlFor="fullName">{t('fullName')}</FormLabel>
              <Input
                id="fullName"
                placeholder={t('fullNamePlaceholder')}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                focusBorderColor="teal.500"
                isInvalid={userName.trim() === ''}
              />
              {userName.trim() === '' && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {t('fullName')} is required
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="email">{t('email')}</FormLabel>
              <Input
                id="email"
                type="email"
                disabled
                placeholder={t('emailPlaceholder')}
                value={user.email}
                bg="gray.50"
              />
            </FormControl>

            <Flex justify="flex-end">
              <Button
                colorScheme="teal"
                isLoading={isLoadingUpdateProfile}
                onClick={handleUpdateProfile}
                disabled={
                  isLoadingUpdateProfile ||
                  userName === user.name ||
                  userName.trim() === ''
                }
                leftIcon={<MdSave />}
                size="md"
              >
                {t('buttons.save')}
              </Button>
            </Flex>
          </Stack>
        </Box>

        {/* ─── Section 3: Language Settings ───────────────────────── */}
        <Box
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="gray.200"
          p={6}
          boxShadow="sm"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={MdLanguage} color="teal.500" boxSize={5} />
            <Heading size="md">{t('language')}</Heading>
          </Flex>
          <Divider mb={4} />

          <Text color="gray.500" fontSize="sm" mb={3}>
            {t('languageDescription')}
          </Text>

          <Select
            id="languageSelect"
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            focusBorderColor="teal.500"
            maxW="300px"
            icon={<MdLanguage />}
          >
            <option value="en">{t('languageEnglish')}</option>
            <option value="vi">{t('languageVietnamese')}</option>
          </Select>

          <Flex mt={3} align="center" gap={2}>
            <Badge colorScheme="teal" fontSize="xs" px={2} py={0.5} borderRadius="md">
              {selectedLanguage === 'en' ? 'EN' : 'VI'}
            </Badge>
            <Text fontSize="xs" color="gray.400">
              {selectedLanguage === 'en' ? 'English' : 'Tiếng Việt'}
            </Text>
          </Flex>
        </Box>
      </Box>
    </SidebarContent>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getServerSideTranslations(context, [
        'common',
        'sidebar',
        'navbar',
        'profile',
      ])),
    },
  };
};
