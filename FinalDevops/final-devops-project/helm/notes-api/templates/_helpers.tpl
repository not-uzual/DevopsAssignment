{{- define "notes-api.fullname" -}}
{{- .Release.Name | trunc 50 | trimSuffix "-" -}}
{{- end -}}

{{- define "notes-api.labels" -}}
app.kubernetes.io/name: notes-api
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end -}}

{{- define "notes-api.selectorLabels" -}}
app.kubernetes.io/name: notes-api
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "notes-api.secretName" -}}
{{- if .Values.secret.existingSecret -}}{{ .Values.secret.existingSecret }}{{- else -}}{{ include "notes-api.fullname" . }}{{- end -}}
{{- end -}}
