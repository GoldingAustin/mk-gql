import { ReplyModelBase } from "./ReplyModel.base"

/* The TypeScript type of an instance of ReplyModel */
export type ReplyModelType = typeof ReplyModel.Type

/* A graphql query fragment containing all the primitive fields of ReplyModel */
export { replyModelPrimitives } from "./ReplyModel.base"

/**
 * ReplyModel
 */
export const ReplyModel = ReplyModelBase
  .actions(self => ({
    // This is just an auto-generated example action, which can be safely thrown away. 
    // Feel free to add your own actions, props, views etc to the model. 
    // Any code outside the '#region mst-gql-*'  regions will be preserved
    log() {
      console.log(JSON.stringify(self))
    }
  }))
