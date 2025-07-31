class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numOfPeople
    };
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//validation
interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
        isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
        isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

//AutoBind
function autobind (target:any , name:string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor : PropertyDescriptor = {
        configurable : true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn
        }
    }
    console.log(target , name, descriptor)
    return adjDescriptor
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[] = [];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
    });
    this.attach();
    this.renderContent();
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
    
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}


//Main code class
class ProjectInput {
    templateElement : HTMLTemplateElement
    hostElement : HTMLDivElement
    element : HTMLFormElement
    titleInput : HTMLInputElement
    descriptionInput : HTMLInputElement
    peopleInput : HTMLInputElement

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = 'user-input'
        

        this.titleInput = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInput = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInput = this.element.querySelector('#people') as HTMLInputElement

        this.configure()
        this.attach()
    }

    private gatherUserInput() : [string,string,number] | void {
        const enteredTitle = this.titleInput.value
        const enteredDescription = this.descriptionInput.value;
        const enteredPeople = this.peopleInput.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        if(titleValidatable || descriptionValidatable || peopleValidatable){
            alert("Invalid input, please try again");
            return;
        } else {
            return [enteredTitle,enteredDescription,+enteredPeople]
        }
    }

    //clear input after submitting
    private clearInput() {
        this.titleInput.value = ''
        this.descriptionInput.value = ''
        this.peopleInput.value = ''
    }

    // after submit of form
    @autobind
    private submitHandler(event : Event) {
        event.preventDefault()
        // console.log(this.titleInput.value)

        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)) {
            // array destructering and project added to active/finished list
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people)
            console.log(userInput)
        } else {
            throw new Error("Invalid or Empty Input values")
        }

        this.clearInput();
    }

    private configure() {
        this.element.addEventListener('submit' , this.submitHandler)
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
    
}

const proj = new ProjectInput()
const activeproj = new ProjectList('active')
const finishedproj = new ProjectList('finished')