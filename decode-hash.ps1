$hexHash = "34306164656164366336316662343733653366376131643033666464383633643A37353965623863" +
           "6665336530666430353234316262653930303236633466346539323438333635343130653839353961316462636165623939383334643935623A313030303030"

$bytes = [byte[]]@()
for ($i = 0; $i -lt $hexHash.Length; $i += 2) {
    $bytes += [byte]::Parse($hexHash.Substring($i, 2), [System.Globalization.NumberStyles]::HexNumber)
}
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
Write-Host "Decoded hash: $text"
Write-Host ""
Write-Host "Expected:     40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000"
