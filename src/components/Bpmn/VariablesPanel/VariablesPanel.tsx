import React, { useEffect, useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import DynamicVariableTable from '@/components/Bpmn/DynamicVariableTable/DynamicVariableTable';
import { Variable } from '@/types/variable';
import {
  convertToRefactoredObject,
  getVariableItemFromLocalStorage,
  replaceVariableStorage,
} from '@/utils/variableService';
import {
  getLocalStorageObject,
  setLocalStorageObject,
} from '@/utils/localStorageService';
import { LocalStorage } from '@/constants/localStorage';
import {
  getProcessFromLocalStorage,
  updateProcessInProcessList,
} from '@/utils/processService';

interface VariablesPanelProps {
  processID: string;
}

export default function VariablesPanel({ processID }: VariablesPanelProps) {
  const initialStorage = getVariableItemFromLocalStorage(processID);
  console.log('initialStorage', initialStorage);
  const [variableList, setVariableList] = useState<Variable[]>(
    initialStorage ? initialStorage.variables : []
  );

  // Listen for variables-updated event from CustomModeler
  useEffect(() => {
    const handleVariablesUpdate = (event: CustomEvent) => {
      if (event.detail.processID === processID) {
        const updatedStorage = getVariableItemFromLocalStorage(processID);
        if (updatedStorage && updatedStorage.variables) {
          setVariableList(updatedStorage.variables);
        }
      }
    };

    // Check immediately on mount - try VARIABLE_LIST first, then fall back to PROCESS_LIST
    const variableStorage = getVariableItemFromLocalStorage(processID);
    if (
      variableStorage &&
      variableStorage.variables &&
      variableStorage.variables.length > 0
    ) {
      setVariableList(variableStorage.variables);
    } else {
      // Try to get from PROCESS_LIST and convert
      const processData = getProcessFromLocalStorage(processID);
      if (
        processData &&
        processData.variables &&
        Object.keys(processData.variables).length > 0
      ) {
        // Convert object format to array format
        const variablesArray = Object.entries(processData.variables).map(
          ([name, data]: [string, any], index) => ({
            id: index + 1,
            name,
            value: data.defaultValue || '',
            isArgument: data.isArgument || false,
            type: data.type || 'string',
          })
        );
        setVariableList(variablesArray);
      }
    }

    window.addEventListener(
      'variables-updated',
      handleVariablesUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        'variables-updated',
        handleVariablesUpdate as EventListener
      );
    };
  }, [processID]);

  // Auto-save when variableList changes
  const saveVariables = useCallback(() => {
    const currentVariable = {
      processID: processID,
      variables: variableList,
    };

    const existingStorage = getVariableItemFromLocalStorage(processID);

    if (!existingStorage) {
      setLocalStorageObject(LocalStorage.VARIABLE_LIST, [
        ...getLocalStorageObject(LocalStorage.VARIABLE_LIST),
        currentVariable,
      ]);
    } else {
      const newStorage = replaceVariableStorage(processID, currentVariable);
      setLocalStorageObject(LocalStorage.VARIABLE_LIST, newStorage);

      const variableListByID = getVariableItemFromLocalStorage(processID);
      const processProperties = getProcessFromLocalStorage(processID as string);
      const refactoredVariables = convertToRefactoredObject(variableListByID);

      const updateStorageByID = {
        ...processProperties,
        variables: refactoredVariables,
      };
      const replaceStorageSnapshot = updateProcessInProcessList(
        processID as string,
        updateStorageByID
      );
      setLocalStorageObject(LocalStorage.PROCESS_LIST, replaceStorageSnapshot);
    }
  }, [processID, variableList]);

  // Auto-save when variableList changes (with debounce effect)
  useEffect(() => {
    if (variableList.length > 0) {
      saveVariables();
    }
  }, [variableList, saveVariables]);

  return (
    <Box px={3} py={2}>
      <DynamicVariableTable
        variableList={variableList}
        setVariableList={setVariableList}
        processID={processID}
      />
    </Box>
  );
}
