using System;
using Buttercup;

using System.Net;

class Program {

	static void Main(string[] args) {
		ButtercupProxyServer bps = new ButtercupProxyServer(handleRequest, "http://localhost:56376/proxy/");
		bps.run();
		Console.WriteLine("A simple webserver. Press a key to quit.");
        Console.ReadKey();
        bps.stop();
	}

	public static string handleRequest(HttpListenerRequest request) {
		return string.Format("<HTML><BODY>Proxy @<br>{0}</BODY></HTML>", DateTime.Now);
	}

}