import net from 'node:net'
import { appendFileSync, writeFileSync } from 'node:fs'

// Local delivery sink only: never forwards email or connects to another host.
const output = process.argv[2]
const port = Number(process.argv[3] || 3302)
if (!output) throw new Error('Provide an isolated SMTP output file')
writeFileSync(output, '')
const server = net.createServer(socket => {
  let buffer = '', data = [], recipients = [], from = '', readingData = false
  socket.setEncoding('utf8')
  socket.write('220 localhost test SMTP\r\n')
  socket.on('error', () => {})
  socket.on('data', chunk => {
    buffer += chunk
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n')
      const line = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      if (readingData) {
        if (line === '.') {
          appendFileSync(output, JSON.stringify({ from, recipients, data: data.join('\r\n') }) + '\n')
          readingData = false
          socket.write('250 Message accepted by local test sink\r\n')
        } else data.push(line.startsWith('..') ? line.slice(1) : line)
      } else if (/^(EHLO|HELO) /i.test(line)) socket.write('250-localhost\r\n250 PIPELINING\r\n')
      else if (/^MAIL FROM:/i.test(line)) { from = line.slice(10); recipients = []; data = []; socket.write('250 OK\r\n') }
      else if (/^RCPT TO:/i.test(line)) { recipients.push(line.slice(8)); socket.write('250 OK\r\n') }
      else if (/^DATA$/i.test(line)) { readingData = true; socket.write('354 End with dot\r\n') }
      else if (/^QUIT$/i.test(line)) socket.end('221 Bye\r\n')
      else if (/^(RSET|NOOP)$/i.test(line)) socket.write('250 OK\r\n')
      else socket.write('502 Unsupported test command\r\n')
    }
  })
})
server.listen(port, '127.0.0.1', () => console.log(`Local SMTP fixture ready on 127.0.0.1:${port}`))
