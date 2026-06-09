import Image from 'next/image';
import React from 'react';
import Logo from '@/assets/images/logo.png';
import { Button, HStack, Container, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import HeaderAIChatbot from './HeaderAIChatbot';

export default function Header() {
  const router = useRouter();
  const { t } = useTranslation('header');
  return (
    <div className="bg-[#fff] w-full shadow-header fixed top-0 left-0 z-10 p-3">
      <Container maxW={'8xl'} px={{ base: 10, md: 14 }}>
        <Flex justify="space-between" align="center" w="100%">
          <Image
          src={Logo}
          width={120}
          height={40}
          alt="Logo"
          className="hover:cursor-pointer w-[120px] h-auto -ml-12"
          onClick={() => router.push('/')}
        />
        <HStack spacing={4}>
          <HeaderAIChatbot />
          <LanguageSwitcher />
          <div className="flex justify-between items-center gap-2">
            <Button
              colorScheme="teal"
              variant="outline"
              onClick={() => router.push('/auth/sign-up')}>
              {t('signUp')}
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              onClick={() => router.push('/auth/login')}>
              {t('signIn')}
            </Button>
          </div>
        </HStack>
        </Flex>
      </Container>
    </div>
  );
}
