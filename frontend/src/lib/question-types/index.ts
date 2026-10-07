import { registerQuestionType } from "./registry"
import { shortTextDefinition } from "./short-text"
import { longTextDefinition } from "./long-text"
import { emailDefinition } from "./email"
import { numberDefinition } from "./number"
import { yesNoDefinition } from "./yes-no"
import { ratingDefinition } from "./rating"
import { multipleChoiceDefinition } from "./multiple-choice"
import { dropdownDefinition } from "./dropdown"

export * from "./types"
export * from "./registry"
export * from "./validators"

// Register all types
registerQuestionType(shortTextDefinition)
registerQuestionType(longTextDefinition)
registerQuestionType(emailDefinition)
registerQuestionType(numberDefinition)
registerQuestionType(yesNoDefinition)
registerQuestionType(ratingDefinition)
registerQuestionType(multipleChoiceDefinition)
registerQuestionType(dropdownDefinition)
