import { Client, Worker, Task, ValidationError } from '@/contexts/data-context';

interface DataSet {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
}

export async function validateData(data: DataSet): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];
  const { clients, workers, tasks } = data;

  errors.push(...validateRequiredColumns(clients, workers, tasks));
  errors.push(...validateDuplicateIds(clients, workers, tasks));
  errors.push(...validateMalformedLists(workers)); 
  errors.push(...validateRanges(clients, tasks));
  errors.push(...validateJSON(clients));
  errors.push(...validateReferences(clients, tasks));
  errors.push(...validateSkillCoverage(workers, tasks));
  errors.push(...validateWorkerOverload(workers));

  return errors;
}

function validateRequiredColumns(clients: Client[], workers: Worker[], tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const requiredClientFields = ['ClientID', 'ClientName', 'PriorityLevel'];
  const requiredWorkerFields = ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots'];
  const requiredTaskFields = ['TaskID', 'TaskName', 'Duration', 'RequiredSkills'];

  clients.forEach(client => {
    requiredClientFields.forEach(field => {
      if (!client[field as keyof Client]) {
        errors.push({
          id: `missing-${client.ClientID}-${field}`,
          type: 'error',
          entity: 'client',
          entityId: client.ClientID,
          field,
          message: `Missing required field: ${field}`,
          suggestion: `Add a value for ${field}`
        });
      }
    });
  });

  workers.forEach(worker => {
    requiredWorkerFields.forEach(field => {
      if (!worker[field as keyof Worker]) {
        errors.push({
          id: `missing-${worker.WorkerID}-${field}`,
          type: 'error',
          entity: 'worker',
          entityId: worker.WorkerID,
          field,
          message: `Missing required field: ${field}`,
          suggestion: `Add a value for ${field}`
        });
      }
    });
  });

  tasks.forEach(task => {
    requiredTaskFields.forEach(field => {
      if (!task[field as keyof Task]) {
        errors.push({
          id: `missing-${task.TaskID}-${field}`,
          type: 'error',
          entity: 'task',
          entityId: task.TaskID,
          field,
          message: `Missing required field: ${field}`,
          suggestion: `Add a value for ${field}`
        });
      }
    });
  });

  return errors;
}

function validateDuplicateIds(clients: Client[], workers: Worker[], tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const clientIds = new Set();
  const workerIds = new Set();
  const taskIds = new Set();

  clients.forEach(client => {
    if (clientIds.has(client.ClientID)) {
      errors.push({
        id: `duplicate-client-${client.ClientID}`,
        type: 'error',
        entity: 'client',
        entityId: client.ClientID,
        field: 'ClientID',
        message: `Duplicate Client ID: ${client.ClientID}`,
        suggestion: 'Ensure all Client IDs are unique'
      });
    }
    clientIds.add(client.ClientID);
  });

  workers.forEach(worker => {
    if (workerIds.has(worker.WorkerID)) {
      errors.push({
        id: `duplicate-worker-${worker.WorkerID}`,
        type: 'error',
        entity: 'worker',
        entityId: worker.WorkerID,
        field: 'WorkerID',
        message: `Duplicate Worker ID: ${worker.WorkerID}`,
        suggestion: 'Ensure all Worker IDs are unique'
      });
    }
    workerIds.add(worker.WorkerID);
  });

  tasks.forEach(task => {
    if (taskIds.has(task.TaskID)) {
      errors.push({
        id: `duplicate-task-${task.TaskID}`,
        type: 'error',
        entity: 'task',
        entityId: task.TaskID,
        field: 'TaskID',
        message: `Duplicate Task ID: ${task.TaskID}`,
        suggestion: 'Ensure all Task IDs are unique'
      });
    }
    taskIds.add(task.TaskID);
  });

  return errors;
}

function validateMalformedLists(workers: Worker[]): ValidationError[] {
  const errors: ValidationError[] = [];

  workers.forEach(worker => {
    if (!Array.isArray(worker.AvailableSlots)) {
      errors.push({
        id: `malformed-slots-${worker.WorkerID}`,
        type: 'error',
        entity: 'worker',
        entityId: worker.WorkerID,
        field: 'AvailableSlots',
        message: 'AvailableSlots must be an array of numbers',
        suggestion: 'Format as [1,2,3] or use comma-separated values'
      });
    } else {
      worker.AvailableSlots.forEach(slot => {
        if (typeof slot !== 'number' || isNaN(slot)) {
          errors.push({
            id: `invalid-slot-${worker.WorkerID}-${slot}`,
            type: 'error',
            entity: 'worker',
            entityId: worker.WorkerID,
            field: 'AvailableSlots',
            message: `Invalid slot value: ${slot} (must be numeric)`,
            suggestion: 'Use only numeric values for available slots'
          });
        }
      });
    }
  });

  return errors;
}

function validateRanges(clients: Client[], tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];

  clients.forEach(client => {
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      errors.push({
        id: `invalid-priority-${client.ClientID}`,
        type: 'error',
        entity: 'client',
        entityId: client.ClientID,
        field: 'PriorityLevel',
        message: `Priority level ${client.PriorityLevel} is out of range (1-5)`,
        suggestion: 'Set priority level between 1 and 5'
      });
    }
  });

  tasks.forEach(task => {
    if (task.Duration < 1) {
      errors.push({
        id: `invalid-duration-${task.TaskID}`,
        type: 'error',
        entity: 'task',
        entityId: task.TaskID,
        field: 'Duration',
        message: `Duration ${task.Duration} must be at least 1`,
        suggestion: 'Set duration to 1 or higher'
      });
    }
  });

  return errors;
}

function validateJSON(clients: Client[]): ValidationError[] {
  const errors: ValidationError[] = [];

  clients.forEach(client => {
    if (client.AttributesJSON) {
      try {
        if (typeof client.AttributesJSON === 'string') {
          JSON.parse(client.AttributesJSON);
        }
      } catch {
        errors.push({
          id: `invalid-json-${client.ClientID}`,
          type: 'error',
          entity: 'client',
          entityId: client.ClientID,
          field: 'AttributesJSON',
          message: 'Invalid JSON format in AttributesJSON',
          suggestion: 'Fix JSON syntax or provide valid JSON object'
        });
      }
    }
  });

  return errors;
}

function validateReferences(clients: Client[], tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const taskIds = new Set(tasks.map(t => t.TaskID)); // ✅ using 'tasks'

  clients.forEach(client => {
    if (Array.isArray(client.RequestedTaskIDs)) {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!taskIds.has(taskId)) {
          errors.push({
            id: `unknown-task-${client.ClientID}-${taskId}`,
            type: 'error',
            entity: 'client',
            entityId: client.ClientID,
            field: 'RequestedTaskIDs',
            message: `Referenced task ${taskId} does not exist`,
            suggestion: 'Remove invalid task reference or add the missing task'
          });
        }
      });
    }
  });

  return errors;
}

function validateSkillCoverage(workers: Worker[], tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const allWorkerSkills = new Set<string>();

  workers.forEach(worker => {
    if (Array.isArray(worker.Skills)) {
      worker.Skills.forEach(skill => allWorkerSkills.add(skill));
    }
  });

  tasks.forEach(task => {
    if (Array.isArray(task.RequiredSkills)) {
      task.RequiredSkills.forEach(skill => {
        if (!allWorkerSkills.has(skill)) {
          errors.push({
            id: `missing-skill-${task.TaskID}-${skill}`,
            type: 'warning',
            entity: 'task',
            entityId: task.TaskID,
            field: 'RequiredSkills',
            message: `No worker has required skill: ${skill}`,
            suggestion: 'Add a worker with this skill or remove the skill requirement'
          });
        }
      });
    }
  });

  return errors;
}

function validateWorkerOverload(workers: Worker[]): ValidationError[] {
  const errors: ValidationError[] = [];

  workers.forEach(worker => {
    if (worker.AvailableSlots && worker.MaxLoadPerPhase) {
      const totalSlots = worker.AvailableSlots.length;
      if (totalSlots < worker.MaxLoadPerPhase) {
        errors.push({
          id: `overload-${worker.WorkerID}`,
          type: 'warning',
          entity: 'worker',
          entityId: worker.WorkerID,
          field: 'MaxLoadPerPhase',
          message: `Max load (${worker.MaxLoadPerPhase}) exceeds available slots (${totalSlots})`,
          suggestion: 'Reduce max load per phase or increase available slots'
        });
      }
    }
  });

  return errors;
}
