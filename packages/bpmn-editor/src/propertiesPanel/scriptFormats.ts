/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export const SCRIPT_LANGUAGE_FORMATS: Record<string, string> = {
  Java: "http://www.java.com/java",
  MVEL: "http://www.mvel.org/2.0",
  Drools: "http://www.jboss.org/drools/rule",
  DROOLS: "http://www.jboss.org/drools/rule",
  drools: "http://www.jboss.org/drools/rule",
  FEEL: "http://www.omg.org/spec/DMN/20180521/FEEL/",
};

export function getScriptFormat(language: string | undefined): string {
  if (!language) {
    return SCRIPT_LANGUAGE_FORMATS.Java;
  }
  return SCRIPT_LANGUAGE_FORMATS[language] ?? SCRIPT_LANGUAGE_FORMATS.Java;
}
