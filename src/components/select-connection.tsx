import { useState } from "react"
import { ConnectionInfo, databases } from "./databases"

export default function SelectConnection({
  connectionInfo,
  setConnectionInfoInfo,
}: {
  connectionInfo: ConnectionInfo
  setConnectionInfoInfo: (info: ConnectionInfo) => void
}) {
  const db = databases[connectionInfo.db]
  return (
    <div>
      Data Provider:{" "}
      <select
        onChange={(e) =>
          setConnectionInfoInfo({
            ...connectionInfo,
            db: e.target.value as any,
          })
        }
      >
        {Object.keys(databases).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      {db != databases.auto && (
        <div>
          {Object.keys(db.args).map((arg) => (
            <div>
              <label htmlFor={arg}>{arg}</label>
              <input
                id={arg}
                key={arg}
                type="text"
                placeholder={
                  'process.env["' + (db.args as any)[arg].envName + '"]'
                }
                onChange={(e) =>
                  setConnectionInfoInfo({
                    ...connectionInfo,
                    args: { ...connectionInfo.args, [arg]: e.target.value },
                  })
                }
                value={connectionInfo.args[arg] || ""}
              />
            </div>
          ))}

          <div>
            <strong>.env</strong>
            <pre>
              {Object.keys(db.args).map((arg) => (
                <div key={arg}>
                  {(db.args as any)[arg].envName}={connectionInfo.args[arg]}
                </div>
              ))}
            </pre>
          </div>
          <div>
            <strong>sh</strong>
            <pre>npm i {db.npm.join(" ")}</pre>
          </div>
          <div>
            <strong>code</strong>
            <pre>{db.getCode(connectionInfo.args)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
