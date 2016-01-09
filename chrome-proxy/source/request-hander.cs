using System;
using System.Net;

namespace Buttercup.Proxy {

	public class RequestHandler {

		public RequestHandler() {

		}

		public string handleRequest(HttpListenerRequest request) {
			return string.Format("<HTML><BODY>Proxy @<br>{0}</BODY></HTML>", DateTime.Now);
		}

	}

}