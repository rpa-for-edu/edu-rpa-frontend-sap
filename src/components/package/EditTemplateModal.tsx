import React, { useEffect } from 'react';
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
  VStack,
  useToast,
  Box,
  Text,
  Badge,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  IconButton,
  Tooltip,
  Divider,
  Select,
  FormHelperText
} from '@chakra-ui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import activityPackageApi from '@/apis/activityPackageApi';
import type { ActivityTemplate } from '@/interfaces/activity-package';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  template: ActivityTemplate;
  onSuccess: () => void;
}

interface ArgumentForm {
  name: string;
  type: string;
  description: string;
  keywordArgument: string;
  isRequired: boolean;
  defaultValue: string;
}

interface FormValues {
  name: string;
  keyword: string;
  description: string;
  keywordName: string;
  pythonMethod: string;
  arguments: ArgumentForm[];
  returnValue: {
    type: string;
    description: string;
    displayName: string;
  };
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isOpen,
  onClose,
  packageId,
  template,
  onSuccess,
}) => {
  const toast = useToast();
  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      keyword: '',
      description: '',
      keywordName: '',
      pythonMethod: '',
      arguments: [],
      returnValue: { type: '', description: '', displayName: '' }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "arguments"
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: template.name,
        keyword: template.keyword,
        description: template.description || '',
        keywordName: template.keywordName || '',
        pythonMethod: template.pythonMethod || '',
        arguments: template.arguments?.map(arg => ({
          name: arg.name,
          type: arg.type,
          description: arg.description || '',
          keywordArgument: arg.keywordArgument || '',
          isRequired: arg.isRequired || false,
          defaultValue: arg.defaultValue || ''
        })) || [],
        returnValue: {
          type: template.returnValue?.type || 'string',
          description: template.returnValue?.description || '',
          displayName: template.returnValue?.displayName || ''
        }
      });
    }
  }, [isOpen, template, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Process arguments: ensure booleans and types are correct
      const processedArgs = data.arguments.map(arg => ({
        ...arg,
        defaultValue: arg.defaultValue === '' ? null : arg.defaultValue
      }));

      // Process return value: if type is empty, send null
      const processedReturnValue = data.returnValue.type ? data.returnValue : null;
      
      await activityPackageApi.updateTemplate(packageId, template.id, {
        name: data.name,
        keyword: data.keyword,
        description: data.description || undefined,
        keywordName: data.keywordName || undefined,
        pythonMethod: data.pythonMethod || undefined,
        arguments: processedArgs,
        returnValue: processedReturnValue
      });
      
      toast({
        title: 'Template updated',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Failed to update template',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const argTypes = [
    'string', 
    'number', 
    'boolean', 
    'list', 
    'dict', 
    'any', 
    'date',
    'email',
    'variable', 
    'dictionary', 
    'DocumentTemplate',
    'connection.Google Drive',
    'connection.Gmail',
    'connection.Google Sheets',
    'connection.Google Classroom',
    'connection.Google Form',
    'connection.SAP Mock',
    'connection.ERP Next',
    'connection.Moodle',
    'enum.shareType',
    'enum.permission',
    'label_ids',
    'list.condition'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Edit Template: {template.keyword}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs colorScheme="teal">
              <TabList>
                <Tab>General</Tab>
                <Tab>Arguments</Tab>
                <Tab>Return Value</Tab>
              </TabList>

              <TabPanels>
                {/* General Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Display Name</FormLabel>
                      <Input {...register('name')} placeholder="e.g. Click Element" />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Keyword (Robot)</FormLabel>
                      <Input {...register('keyword')} placeholder="e.g. Click Element" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea {...register('description')} />
                    </FormControl>

                    <HStack>
                      <FormControl>
                        <FormLabel>Internal Keyword Name</FormLabel>
                        <Input {...register('keywordName')} placeholder="Internal keyword identifier" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Python Method</FormLabel>
                        <Input {...register('pythonMethod')} placeholder="e.g. click_element" />
                      </FormControl>
                    </HStack>
                  </VStack>
                </TabPanel>

                {/* Arguments Tab */}
                <TabPanel px={0}>
                  <Box mb={4} textAlign="right">
                    <Button 
                      leftIcon={<AddIcon />} 
                      size="sm" 
                      colorScheme="teal" 
                      variant="outline"
                      onClick={() => append({
                        name: 'New Argument',
                        type: 'string',
                        description: '',
                        keywordArgument: '',
                        isRequired: false,
                        defaultValue: ''
                      })}
                    >
                      Add Argument
                    </Button>
                  </Box>
                  
                  <VStack spacing={4} align="stretch">
                    {fields.map((field, index) => (
                      <Box 
                        key={field.id} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        bg="gray.50"
                        position="relative"
                      >
                         <IconButton
                          aria-label="Remove argument"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={() => remove(index)}
                        />
                        
                        <VStack spacing={3}>
                          <HStack width="100%" pr={8}>
                            <FormControl isRequired>
                              <FormLabel fontSize="sm">Name</FormLabel>
                              <Input size="sm" {...register(`arguments.${index}.name` as const)} bg="white" />
                            </FormControl>
                            <FormControl isRequired w="150px">
                              <FormLabel fontSize="sm">Type</FormLabel>
                              <Select size="sm" {...register(`arguments.${index}.type` as const)} bg="white">
                                {argTypes.map(t => <option key={t} value={t}>{t}</option>)}
                              </Select>
                            </FormControl>
                            <FormControl w="150px">
                              <FormLabel fontSize="sm">Required</FormLabel>
                              <HStack>
                                <Switch size="sm" colorScheme="teal" {...register(`arguments.${index}.isRequired` as const)} />
                                <Text fontSize="xs">Yes</Text>
                              </HStack>
                            </FormControl>
                          </HStack>
                          
                          <HStack width="100%">
                             <FormControl>
                              <FormLabel fontSize="sm">Python Arg Name</FormLabel>
                              <Input size="sm" {...register(`arguments.${index}.keywordArgument` as const)} bg="white" placeholder="e.g. locator" />
                            </FormControl>
                            <FormControl>
                              <FormLabel fontSize="sm">Default Value</FormLabel>
                              <Input size="sm" {...register(`arguments.${index}.defaultValue` as const)} bg="white" />
                            </FormControl>
                          </HStack>

                          <FormControl>
                            <FormLabel fontSize="sm">Description</FormLabel>
                            <Input size="sm" {...register(`arguments.${index}.description` as const)} bg="white" />
                          </FormControl>
                        </VStack>
                      </Box>
                    ))}
                    {fields.length === 0 && <Text textAlign="center" color="gray.500">No arguments defined.</Text>}
                  </VStack>
                </TabPanel>

                {/* Return Value Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Return Type</FormLabel>
                      <Select {...register('returnValue.type')} placeholder="None (No return value)">
                        {argTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </Select>
                      <FormHelperText>Select 'None' if the keyword returns nothing.</FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Display Name (Result)</FormLabel>
                      <Input {...register('returnValue.displayName')} placeholder="e.g. Content" />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea {...register('returnValue.description')} />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
             <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditTemplateModal;
