import { it, expect } from "vitest"
import { createTableEntity } from "./createTableEntity"

it("test full entity", () => {
  expect(
    createTableEntity("test", [
      {
        name: "taskid",
        type: "character varying",
        nullable: false,
        maxLength: null,
        datetime_precision: null,
        column_default: "''::character varying",
      },
      {
        name: "onemorething",
        type: "character varying",
        nullable: false,
        maxLength: null,
        datetime_precision: null,
        column_default: "''::character varying",
      },
      {
        name: "check1",
        type: "boolean",
        nullable: false,
        maxLength: null,
        datetime_precision: null,
        column_default: "false",
      },
    ])
  ).toMatchInlineSnapshot(`
    "import { Entity, Fields } from "remult"
        
    @Entity<test>("test", { 
      allowApiCrud: true,
      defaultOrderBy: { taskid: "asc" } 
    })
    export class test {

      @Fields.string()
      taskid = ''

      @Fields.string()
      onemorething = ''

      @Fields.boolean()
      check1 = false
    }"
  `)
})
