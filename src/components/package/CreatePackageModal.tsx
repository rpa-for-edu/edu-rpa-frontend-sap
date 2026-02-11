import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  useToast,
  VStack,
  FormHelperText,
  Box,
  Text,
  Icon,
  HStack,
  Badge
} from '@chakra-ui/react';
import { AttachmentIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import activityPackageApi from '@/apis/activityPackageApi';
import type { ActivityPackage } from '@/interfaces/activity-package';

interface CreatePackageModalProps {
  isOpen: boolean;
  editingPackage?: ActivityPackage | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  displayName: string;
  description: string;
  library: string;
  packageVersion: string;
  libraryVersion: string;
}

const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  isOpen,
  editingPackage,
  onClose,
  onSuccess,
}) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm<FormValues>();
  
  const [libraryFile, setLibraryFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const isEditing = !!editingPackage;

  useEffect(() => {
    if (isOpen && editingPackage) {
      setValue('displayName', editingPackage.displayName);
      setValue('description', editingPackage.description || '');
      setValue('library', editingPackage.library || '');
      setValue('packageVersion', editingPackage.version || '1.0.0');
      setValue('libraryVersion', editingPackage.libraryVersion || '');
      setLibraryFile(null);
    } else if (isOpen) {
      reset({
        displayName: '',
        description: '',
        library: '',
        packageVersion: '1.0.0',
        libraryVersion: '',
      });
      setLibraryFile(null);
    }
  }, [isOpen, editingPackage, setValue, reset]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate extension
    const validExtensions = ['.py', '.whl'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidExtension) {
      toast({
        title: 'Invalid file type',
        description: 'Only .py and .whl files are allowed',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate size (50MB)
    const isLt50M = selectedFile.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      toast({
        title: 'File too large',
        description: 'File must be smaller than 50MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLibraryFile(selectedFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (libraryFile && !values.libraryVersion) {
        toast({
          title: 'Library Version Required',
          description: 'Please provide a version for the library file',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      // Auto-generate name from displayName
      const generatedName = values.displayName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/^-+|-+$/g, '');     // Trim hyphens

      if (isEditing) {
        // Update package logic if needed, currently mainly for library upload
        if (libraryFile) {
          await activityPackageApi.uploadLibrary(
            editingPackage!.id, 
            libraryFile, 
            values.libraryVersion
          );
        }
        
        toast({
          title: 'Package updated successfully',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Create new package
        const newPackage = await activityPackageApi.createPackage({
          id: generatedName, // Use generated slug as ID
          displayName: values.displayName,
          description: values.description || undefined,
          library: values.library || undefined,
          version: values.packageVersion || undefined,
          libraryVersion: values.libraryVersion || undefined,
        });

        if (libraryFile) {
          await activityPackageApi.uploadLibrary(
            newPackage.id, 
            libraryFile, 
            values.libraryVersion
          );
        }
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: 'Failed to save package',
        description: error.response?.data?.message || 'Unknown error occurred',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    reset();
    setLibraryFile(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader color="teal.600">
            {isEditing ? 'Edit Package' : 'Create New Package'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.displayName} isRequired>
                <FormLabel>Package Name</FormLabel>
                <Input 
                  placeholder="e.g. ERPNext Automation" 
                  {...register('displayName', { required: 'Package name is required' })}
                  focusBorderColor="teal.500"
                />
                <FormHelperText>User-friendly name shown in UI</FormHelperText>
                <FormErrorMessage>{errors.displayName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  placeholder="Package for ERPNext integration and automation" 
                  {...register('description')}
                  rows={3}
                  focusBorderColor="teal.500"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Library Name</FormLabel>
                <Input 
                  placeholder="RPA.ERPNext" 
                  {...register('library')}
                  focusBorderColor="teal.500"
                />
                <FormHelperText>
                  Robot Framework library name (e.g., RPA.ERPNext)
                </FormHelperText>
              </FormControl>

              <HStack spacing={4}>
                <FormControl isInvalid={!!errors.packageVersion}>
                  <FormLabel>Package Version</FormLabel>
                  <Input 
                    placeholder="1.0.0" 
                    {...register('packageVersion', { 
                      pattern: {
                        value: /^\d+\.\d+\.\d+$/,
                        message: 'X.Y.Z format'
                      }
                    })}
                    focusBorderColor="teal.500"
                  />
                  <FormErrorMessage>{errors.packageVersion?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.libraryVersion} isRequired={!!libraryFile}>
                  <FormLabel>Library Version</FormLabel>
                  <Input 
                    placeholder="1.0.0" 
                    {...register('libraryVersion', { 
                      required: !!libraryFile ? 'Required for upload' : false,
                      pattern: {
                        value: /^\d+\.\d+\.\d+$/,
                        message: 'X.Y.Z format'
                      }
                    })}
                    focusBorderColor="teal.500"
                  />
                   <FormErrorMessage>{errors.libraryVersion?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Library File Upload */}
              <FormControl>
                <FormLabel>Python Library File (Optional)</FormLabel>
                <Box 
                  borderWidth={2} 
                  borderStyle="dashed" 
                  borderRadius="md" 
                  p={4} 
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  borderColor={libraryFile ? "teal.400" : "gray.300"}
                  bg={libraryFile ? "teal.50" : "gray.50"}
                  _hover={{ borderColor: "teal.400", bg: "teal.50" }}
                  transition="all 0.2s"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".py,.whl"
                    onChange={onFileChange}
                  />
                  <VStack spacing={2}>
                    <Icon 
                      as={AttachmentIcon} 
                      w={6} 
                      h={6} 
                      color={libraryFile ? "teal.500" : "gray.400"} 
                    />
                    {libraryFile ? (
                      <HStack>
                        <Text fontWeight="bold" color="teal.600">{libraryFile.name}</Text>
                        <Badge colorScheme="teal">{formatFileSize(libraryFile.size)}</Badge>
                      </HStack>
                    ) : (
                      <>
                        <Text fontSize="sm">Click to select a Python library file</Text>
                        <Text fontSize="xs" color="gray.500">
                          Supported: .py, .whl (max 50MB)
                        </Text>
                      </>
                    )}
                  </VStack>
                </Box>
                {isEditing && editingPackage?.libraryFileName && !libraryFile && (
                  <FormHelperText>
                    Current library: {editingPackage.libraryFileName}
                    {editingPackage.libraryVersion && ` (v${editingPackage.libraryVersion})`}
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={handleClose} mr={3}>Cancel</Button>
            <Button 
              colorScheme="teal" 
              type="submit" 
              isLoading={isSubmitting}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreatePackageModal;
